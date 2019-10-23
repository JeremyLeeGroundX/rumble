var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect('/hello');
});
router.get('/hello', function(req, res, next) {
  res.send('{hello:normal}');
});
module.exports = router;
