#!/usr/bin/env node
console.log('here 0, hi!')
const mongo = require('mongodb');
console.log('here 1')
const querystring = require('querystring');
console.log('here 2')
const url = require('url');
console.log('here 3')
const express = require('express');
console.log('here 4')
const cors = require('cors')
console.log('here 5')
const bodyParser = require('body-parser');
console.log('here 6')
const mysql = require('mysql');
console.log('here 7')

console.log('here 8')
const server = express();
console.log('here 9')
server.use(cors());
console.log('here 10')
server.use(bodyParser.urlencoded({ extended: false })); 
console.log('here 11')
server.use(bodyParser.json());
console.log('here 12')

console.log('here 13')
const connection = mysql.createConnection({
	host: 'mysql',
	user: 'crypto',
	database: 'backtests',
});

connection.connect();


server.route('/users').get((request, response) => {
	console.log('hitting /users');
	connection.query('SELECT user FROM mysql.user', (err, res, fields) => {
		response.send(res);
	});
});

server.route('/results').post((request, response) => {
	console.log('hitting /results');
});

server.route('/test').get((request, response) => {
	response.send('beep boop');
});

// mongo.connect('mongodb://localhost:27017', (err, client) => {
//  let db = client.db('gekkoga');
//  let results = db.collection('results');
//  if (!err) {
//      server.route('/results').post((request, response) => {
//          // let body = request.body;
//          // console.log('body: ', body);
//          console.log('request.body.params: ', request.body.params);
//          console.log('request.body.query: ', request.body.query);
//          console.log('request.body.projection: ', request.body.projection);
//          console.log('request.body.skip: ', request.body.skip);


//          let limit = parseInt(request.body.limit) || 1000;
//          let query = request.body.query || {};
//          let projection = request.body.projection || {};
//          let skip = request.body.skip || 0;
//          results
//              .find(query, projection)
//              .limit(limit)
//              .skip(skip)
//              .toArray().then(res => {
//                  response.send(res);
//              });
//          });

//      let getInfo = function(query) {
//          console.log('query: ', query);
//          let paramMap = [
//              { asset: 'assets' },
//              { currency: 'currencies' },
//              { strategy: 'strategies' },
//          ];
//          itemsCollected = [];
//          let queries = [];

//          paramMap.map(item => {

//              let key = Object.keys(item)[0];

//              if (typeof query[key] == 'undefined') {
//                  queries.push(results.distinct(key, query));
//                  console.log('item[key]: ', item[key]);
//                  itemsCollected.push(item[key]);
//              }
//          });
//          console.log('itemsCollected: ', itemsCollected);
//          let getTrades = true;

//          if(!query['metrics.trades']) {
//              queries.push(
//                  results.find(query)
//                      .project({'metrics.trades': 1, '_id': 0})
//                      .sort({'metrics.trades': -1})
//                      .limit(1)
//                      .toArray()
//              )
//          } else getTrades = false;
		
//          return Promise.all([
//              ...queries,
//              results.find(query)
//                  .sort({'metrics.startTime': 1})
//                  .limit(1)
//                  .toArray(),
//              results.find(query)
//                  .sort({'metrics.endTime': -1})
//                  .limit(1)
//                  .toArray(),
//              results.find(query)
//                  .sort({'metrics.profitPerTrade': -1})
//                  .limit(1)
//                  .toArray(),
//              results.find(query)
//                  .sort({'metrics.profitPerTrade': 1})
//                  .limit(1)
//                  .toArray(),
//              results.find(query)
//                  .sort({'metrics.relativeProfit': -1})
//                  .limit(1)
//                  .toArray(),
//              results.find(query)
//                  .sort({'metrics.relativeProfit': 1})
//                  .limit(1)
//                  .toArray(),
//              ]
//          ).then(results => {
//              let res = {};
//              let i = 0;

// console.log('results: ', results);
//              while (i < itemsCollected.length) {
//                  res[itemsCollected[i]] = results[i];
//                  i++;
//              }

//              if (getTrades) res.trades = {
//                  min: 0,
//                  max: results[i++][0].metrics.trades,
//              };

//              res.time = {
//                  min: results[i++][0].metrics.startTime,
//                  max: results[i++][0].metrics.endTime,
//              };

//              res.profit = {
//                  min: results[i++][0].metrics.relativeProfit,
//                  max: results[i++][0].metrics.relativeProfit,
//              };

//              console.log('res: ', res);
//              return res;
//          }).catch(err => console.error(err));
//      }

//      server.route('/info').get((request, response) =>
//          getInfo().then( res => response.send(res) )
//      );

//      server.route('/info').post((request, response) =>
//          getInfo(request.body.query || {}).then( res => response.send(res) )
//      );

//      server.route('/distinct').post((request, response) => {

//          let {field, query} = request.body;
//          results.distinct(field, query || 'currency').then(res => {
//              response.send(res);
//          });
//      });

//      server.route('/test').get((request, response) => {
//          results.aggregate([{
//              $match: {
//                  asset: 'XVG',
//                      roundtrips: {
//                          $elemMatch: {
//                              entryAt: { $gt: 1521703140000 },
//                              exitAt: { $lt: 1526247300000 }
//                          }
//                      }
//                  }
//              }, {
//              $project: {
//                  asset: '$asset',
//                      roundtrips: {
//                          $filter: {
//                              input: '$roundtrips',
//                              as: 'roundtrip',
//                              cond: {
//                                  $and: [
//                                      { $lt: ['$entryAt', 1521703140000] }
//                                  ]
//                              } 
//                          }
//                      } 
//                  }
//              }
//          ]);
//      });


		


//      server.route('/addProfitPerTradeWhereMissing').get((request, response) => {
//          results.find({'metrics.marketPerTrade': {$exists: 0}}).toArray().then(res => {

//              let promises = [];
//              res.forEach(function(el) {
//                  let ppt = el.metrics.trades > 0 ? el.metrics.market / el.metrics.trades : 0;
//                  promises.push(results.update({_id: el._id}, {$set: {'metrics.marketPerTrade': ppt}}));
//              });
//              Promise.all(promises).then(() => {
//                  console.log('whaaa');
//                  response.send(arguments);
//              });
//          });
//      });
//  } else { process.exit(1); }
// });

server.listen(3000);
console.log('server started on port 3000');

let exitGracefully = err => {
	console.log('exiting gracefully');
	console.log('err: ', err);
	doExitActions();
	process.exit();
}

let doExitActions = () => {
	connection.end();
}

process.on('exit', doExitActions);

process.on('uncaughtException', exitGracefully);
