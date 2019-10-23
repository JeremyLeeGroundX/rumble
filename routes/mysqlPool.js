var config = require('../config');
var mysql = require('mysql');
var pool = mysql.createPool(
	config.mysql
);

module.exports = pool;
