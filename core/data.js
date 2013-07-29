"use strict";

var config = require('../config.js');
var log = require('../lib/logger.js');

var pool = require('mysql').createPool(config.mysql);
exports.get =function(cb){
  pool.getConnection(cb);  
};





//var db = require('mysql').createConnection(config.mysql);
//
//function handleDisconnect(connection) {
//  connection.on('error', function(err) {
//    log('MySQL connection error', err);
//    if (!err.fatal) {
//      return;
//    }
//
//    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
//      throw err;
//    }
//
//    log('Re-connecting lost connection: ' + err.stack);
//
//    connection = require("mysql").createConnection(connection.config);
//    handleDisconnect(connection);
//    connection.connect();
//  });
//}
//
//handleDisconnect(db);
//
//module.exports = db;