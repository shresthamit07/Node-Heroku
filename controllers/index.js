var express = require('express')
  , router = express.Router()

router.use(require('./users'))
router.use(require('./products'))

router.get('/', function(req, res) {
	console.log(req.session.passport);
	var params = {data: []}
	if(!isEmpty(req.session.passport)){
		params = {data: [], session: true, id: req.session.passport.user.id, name: req.session.passport.user.first_name}
	}
  res.render('index', params);
})

var isEmpty = function(obj) { 
   for (var x in obj) { return false; }
   return true;
}

module.exports = router