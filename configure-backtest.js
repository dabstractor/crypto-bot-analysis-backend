const commander = require('commander-plus');
const nodePlop = require('node-plop');
const plop = nodePlop('./backtests/plopfile.js');
const fs = require('fs');
const mongo = require('mongodb');
const colors = require('colors');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();

let getCollections = function(db) {
	return db.collections();
}

let convertCollections = collections => collections.map(collection => collection.collectionName);

let getChoices = function(db) {
	return collectionNames => new Promise((resolve, reject) => {
		let queryPromises = [];
		collectionNames.forEach(name => {
			queryPromises.push(db.collection(name).distinct('pair'));
		});

		return Promise.all(queryPromises).then(results => resolve({queryResults: results, collectionNames}));
	});
}

let convertChoices = ({queryResults, collectionNames}) => {
	let choices = {};
	collectionNames.forEach((name,i) => {
		let results = queryResults[i];
		let newResults = {};
		results.forEach(field => {
			let asset = field.replace(/^.*_/, '');
			let currency = field.replace(/_.*$/, '');
			if (typeof newResults[currency] == 'undefined') newResults[currency] = [];
			newResults[currency].push(asset);
		});

		choices[name.replace(/_candles$/,'')] = newResults;
	});

	return choices;
}

let promptUser = function(choices) {
	return new Promise((resolve, reject) => {
		promptAssets(choices)
			.then(promptCurrencies)
			.then(promptExchanges)
			.then(data => resolve(data));
	});
}

let getAssetsFromChoices = function(choices) {
	let assets = [];
	Object.keys(choices).forEach(exchange => {
		Object.keys(choices[exchange]).forEach(currency => {
			choices[exchange][currency].forEach(asset => {
				if (!assets.find(a => a === asset)) assets.push(asset);
			});
		})
	});
	return assets;
}

let getCurrenciesFromChoices = function(choices, asset) {
	let currencies = [];

	Object.keys(choices).forEach(exchange => {
		Object.keys(choices[exchange]).forEach(currency => {
			if (
				choices[exchange][currency].find(asset => asset)
					&& !currencies.find(asset => asset)
			) currencies.push(currency);
		});
	});
	return currencies;
}

let getExchangesFromChoices = function(choices, asset, currency) {
	let exchanges = [];
	console.log('choices: ', choices);
	Object.keys(choices).forEach(exchange => {
		if (typeof choices[exchange][currency] != 'undefined'
			&& choices[exchange][currency].find(a => a === asset)) {
			exchanges.push(exchange);
		}
	}); 
	return exchanges;
}

let promptAssets = function(choices) {
	let assets = getAssetsFromChoices(choices);

	return new Promise((resolve, reject) => {
		prompt([{
			type: 'list',
			name: 'asset',
			message: 'Asset (coin):',
			choices: assets,
		}]).then(data => resolve({data, choices}));
	});
}

let promptCurrencies = function({data, choices}) {
	let currencies = getCurrenciesFromChoices(choices, data.asset);
	let message = 'Currency (pair): ';
	return new Promise((resolve, reject) => {
		if (currencies.length > 1) {
			prompt([{
				type: 'list',
				name: 'currency',
				message,
				choices: currencies
			}]).then(newData => resolve({ data: {...data, ...newData}, choices }));
		} else {
			console.log(message.bold + ' ' + currencies[0]);
			resolve({ data: {...data, currency: currencies[0] }, choices });
		}
	})
}

let promptExchanges = function({data, choices}) {
	let exchanges = getExchangesFromChoices(choices, data.asset, data.currency);
	let message = 'Available on exchanges:';

	if (exchanges.length > 1) {
		return prompt([{
			type: 'list',
			name: 'exchange',
			message,
			choices: exchanges,
		}]).then(newData => ({asset: data.asset, currency: data.currency, exchange: newData.exchange}));
	} else {
		let {asset, currency} = data;
		console.log(message.bold + ' ' + exchanges[0]);
		return {
			asset,
			currency,
			exchange: exchanges[0]
		}
	}
}

let runActions = function(data) {
	fs.readdirSync('backtests/config').forEach(fileName => fs.unlinkSync(`backtests/config/${fileName}`));
	let backtests = plop.getGenerator('backtests');

	return backtests.runActions(data).then(results => {
		if (!results.failures.length) {
			console.log('Great success!!  Time to backtest!!'.bold);
		} else throw Error('Something went wrong', results.failures);
	});
}

// main script starts here
let run = function(client) {
	let db = client.db('gekko');

	return getCollections(db)
		.then(convertCollections)
		.then(getChoices(db))
		.then(convertChoices)
		.then(promptUser)
		.then(runActions)
		.catch(err => console.error(err));
}


// execution begins here
mongo.connect('mongodb://localhost:27017', (err, client) => {
	if (err) process.exit(1);
	run(client).then(() => process.exit(0));
});
