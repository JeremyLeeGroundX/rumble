var logger = require('../logger');
var config = require('../../config');
const AWS = require('aws-sdk');
var moment = require('moment');

var kinesis = new AWS.Kinesis({region : config.kinesis.region});

write = async function(data, dataType) {

  var currTime = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
  var sensor = 'sensor-' + Math.floor(Math.random() * 100000);

  var record = JSON.stringify({
    time : currTime,
    type: dataType,
    data : data
  });

  var recordParams = {
    Data : record,
    PartitionKey : sensor,
    StreamName : config.kinesis.stream,
  };

  let results;
  try {
      results = await kinesis.putRecord(recordParams).promise();
  } catch(err) {
    logger.error(err);
  }

  // logger.info(results);
  return results;
};

module.exports.write = write;