let fs = require('fs');
let stratNames = fs
	.readdirSync('backtests/templates')
	.filter(name => name.endsWith('.js.template'))
	.map(name => name.replace(/\.js\.template$/, ''));

let actions = [];

stratNames.forEach(name => actions.push({
	type: 'add',
	path: `./config/${name}.js`,
	templateFile: `./templates/${name}.js.template`
}));

module.exports = function(plop) {
	plop.setGenerator('backtests', {
		description: 'Generate a uniform set of backtests',
		prompts: [{
			type: 'input',
			name: 'asset',
			message: 'asset (coin)',
		},{
			type: 'input',
			name: 'currency',
			message: 'currency',
		}],
		actions,
	});
}