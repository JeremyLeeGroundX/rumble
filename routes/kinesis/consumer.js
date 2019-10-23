var AWS = require('aws-sdk');
var logger = require('../logger');
var util = require('util');
var config = require('../../config');
var kinesis = new AWS.Kinesis({region : config.kinesis.region,
  params: { StreamName: config.kinesis.streamRt }});

var options = {
  // shardId: 'shard-identifier', // defaults to first shard in the stream
  iterator: 'LATEST', // default to TRIM_HORIZON
  // startAfter: '12345678901234567890', // start reading after this sequence number
  // startAt: '12345678901234567890', // start reading from this sequence number
  // timestamp: '2016-04-04T19:58:46.480-00:00', // start reading from this timestamp
  // limit: 100 // number of records per `data` event
};


var readable;
startConsume = function() {
  readable = require('kinesis-readable')(kinesis, options);
  readable.on('data', function(records) {
    // console.log('CONSUME:', records);

    for (var i = 0 ; i < records.length ; ++i) {
      let record = records[i];
      let data = new Buffer(record.Data, 'base64').toString();
      sequenceNumber = record.SequenceNumber;
      partitionKey = record.PartitionKey;
      logger.info(util.format('Record: %s, SeqenceNumber: %s, PartitionKey:%s', data, sequenceNumber, partitionKey));
    }
  })
    .on('checkpoint', function(sequenceNumber) {
      logger.info('CHECKPOINT:', sequenceNumber);
    })
    .on('error', function(err) {
      logger.error(err);
    })
    .on('end', function() {
      logger.info('consume closed');
    });
  logger.info("CONSUME STARTED");
  return "Start Consume";
}
endConsume = function() {
  readable.close();
  logger.info("CONSUME CLOSED");
  return "End Consume";
}

module.exports.startConsume = startConsume;
module.exports.endConsume = endConsume;