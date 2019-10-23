
module.exports.kinesis = {
  region: 'ap-northeast-2',
  stream: 'klaytn-data-test',
  streamRt: 'klaytn-rt-test',
  shard: 1
};

module.exports.logger = {
  level : "info"
};

module.exports.klaytn = {
  cypress: 'wss://api.cypress.klaytn.net:8652'
}