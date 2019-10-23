const config = require('../../config')
const Caver = require('caver-js');
const caver = new Caver(new Caver.providers.WebsocketProvider('wss://api.cypress.klaytn.net:8652'));

var logger = require("../logger");
const kinesis = require('../kinesis');

var subscribeKey = [];


writeTransactions = async function(trans) {
  logger.info("TRANS count: ", trans.length);
  for(tr of trans) {
    try {
      let data = await caver.klay.getTransaction(tr)


      logger.debug("TRANS:", data);
      kinesis.write(data, "transaction");
    } catch(err) {
      logger.error(err);
    }

  }
}

startSubscribe = function() {
  subscribeKey = [];
  let blockSubs = caver.klay.subscribe("newBlockHeaders", (err, event) => {

    if (err) {
      logger.error("SUBS: new block", err);
      return err;
    }

    let data;
    logger.info("Block number", event.number);
    // logger.info("Transaction Count", caver.klay.getTransactionCount(event.number));
    caver.klay.getBlock(event.number)
      .then((data) => {
        data.transactionCount = data.transactions.length;
        kinesis.write(data, "block");
        logger.debug("BLOCK:", data);

        if(data.transactions.length > 0) {
          writeTransactions(data.transactions);
        }
      })
      .catch(err => {
        logger.error(err);
      });

  });


  subscribeKey.push(blockSubs);

  let logsSubs = caver.klay.subscribe("logs", {}, async (err, event) => {
    if (err) {
      logger.error("SUBS: logs", err);
      return err;
    }
    kinesis.write(event, "logs");
    logger.debug("LOGS:", event);
    logger.info("LOGS");
  });

  subscribeKey.push(logsSubs);
  let pendTransSubs = caver.klay.subscribe("pendingTransactions", async (err, event) => {
    if (err) {
      logger.error("SUBS: pendingTransactions", err);
      return err;
    }

    caver.klay.getTransaction(event)
      .then(trans => {
        kinesis.write(trans, "pendingTransactions");
        logger.debug('PENDING TRANS: ', trans);
        logger.info('PENDING TRANS');
      })
      .catch(err => {
        logger.error(err);
      });

  });

  subscribeKey.push(pendTransSubs);

  let syncSubs = caver.klay.subscribe("syncing", async (err, event) => {
    if (err) {
      logger.error("SUBS: syncing", err);
      return err;
    }
    kinesis.write("syncing", event);
    logger.debug('SYNC', event);
    logger.info('SYNC');

  });

  subscribeKey.push(syncSubs);

  let res = {subscirbe: []};
  for (let sub of subscribeKey) {
    res.subscirbe.push(sub.subscriptionMethod);
    logger.info("SUBCRIBE:" + sub.subscriptionMethod);
  }
  return res;
}

endSubscribe = function() {
  return new Promise((resolve, reject) => {
    let res = {unsubscirbe: []};
    for(let index in subscribeKey) {
      subscribeKey[index].unsubscribe((err, success) => {
        if(err) return reject(err);
        res.unsubscirbe.push({
          method: subscribeKey[index].subscriptionMethod,
          success:success
        });

        if(res.unsubscirbe.length == subscribeKey.length) {
          res = [];
          return resolve(res);
        }
      })
    }
  });

}

test3 = async function()  {
  let block = await caver.klay.getBlockNumber();
  console.log(block);

  return block;
}

module.exports.startSubscribe = startSubscribe;
module.exports.endSubscribe = endSubscribe;
module.exports.test3 = test3;