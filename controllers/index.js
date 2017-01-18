var express = require('express')
  , router = express.Router()

router.use(require('./users'))

router.get('/', function(req, res) {
  res.render('index', {data: []});
})

module.exports = router