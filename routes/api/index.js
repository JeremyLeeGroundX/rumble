var express = require('express');
var router = express.Router();
var handler = require('../event/handler');
var kinesis = require('../kinesis');
var kConsumer = require('../kinesis/consumer');

router.get('/hello', function(req, res, next) {

  res.status(200).send(
    {
      result : 'api hello',
      q: req.query.q
    });
});
// /hello/test?q=query
router.get('/hello/:p',  function(req, res, next) {

  res.status(200).send(
    {
      result : 'api hello',
      q: req.query.q,
      p: req.params.p
    });
});

///////////

router.get('/test3', function(req, res, next) {

  handler.test3()
    .then( results => {
      return res.status(200).send({
        blocks: results
      });
    })
    .catch(err => {
      if(err) return next(err);
    })

});
router.get('/subscribe/start', function(req, res, next) {

  var results = handler.startSubscribe();
  return res.status(200).send(results);
});
router.get('/subscribe/stop', function(req, res, next) {

  handler.endSubscribe()
    .then( results => {
      return res.status(200).send(results);
    })
    .catch(err => {
      if(err) return next(err);
    })

});


router.get('/write', function(req, res, next) {
  let data = req.query.data;

  kinesis.write(data, 'api-test')
    .then( results => {
      return res.status(200).send({
        results: results
      });
    })
    .catch(err => {
      if(err) return next(err);
    })
});

router.get('/consume/start', function(req, res, next) {

  let stream = req.query.stream;

  var results = kConsumer.startConsume(stream);
  res.status(200).send({
    results: results
  });
});
router.get('/consume/stop', function(req, res, next) {

  var results = kConsumer.endConsume();
  res.status(200).send({
    results: results
  });
});
module.exports = router;
