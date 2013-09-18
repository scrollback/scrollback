"use strict";

var config = require('../config.js');
var log = require('../lib/logger.js');

var pool = require('mysql').createPool(config.mysql);
exports.get =function(cb){
  pool.getConnection(cb);  
};

