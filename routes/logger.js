var config = require('../config');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.logger.level;

module.exports = logger;