var AWS = require('aws-sdk');
var log = require('../logger');
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


// read = async function() {
//   let streamRes = await kinesis.describeStream({StreamName: config.kinesis.stream}).promise();
//
//   console.log("length:", streamRes.StreamDescription.Shards.length);
//
//   // now get the Stream's shardIterator and start getting records in a loop
//   let shardIt = await kinesis.getShardIterator({
//     StreamName:config.kinesis.stream,
//     ShardId:data.StreamDescription.Shards[0].ShardId,
//     ShardIteratorType:'LATEST'
//   }).promise();
//
//   console.log("shardIt:", shardIt);
//
//   for(let it of shiardIt) {
//     console.log('it:', it);
//
//     let data = await kinesis.getRecords({ShardIterator:it}).promise();
//     console.log("rec:", rec);
//
//     for(let record of data.Records) {
//       console.log(data.Records[record].Data);
//
//     }
//
//   }
//
//
//   return streamRes;
// }
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
      log.info(util.format('Record: %s, SeqenceNumber: %s, PartitionKey:%s', data, sequenceNumber, partitionKey));
    }
  })
    .on('checkpoint', function(sequenceNumber) {
      console.log('CHECKPOINT:', sequenceNumber);
    })
    .on('error', function(err) {
      console.error(err);
    })
    .on('end', function() {
      console.log('consume closed');
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