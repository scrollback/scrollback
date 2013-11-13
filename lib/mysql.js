"use strict";

var config = require('../config.js');
var log = require('./logger.js');

var pool = require('mysql').createPool(config.mysql);

exports.query = function(query, params, callback) {
    pool.getConnection(function(err, conn) {
        if(err && callback) return callback(err);
        conn.query(query, params, function(err, data) {
            if(conn.release)
            	conn.release();
            else
            	conn.end();
            callback && callback(err, data);
        });
    });
};