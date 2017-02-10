var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var app = module.exports = express();

var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

var client = new pg.Client(connectionString);
client.connect();

router.get('/products/:category', function(req, res, next) {
  // console.log(req.session.passport);
  // var params = {data: []}
  // if(!isEmpty(req.session.passport)){
  //   params = {data: [], session: true, id: req.session.passport.user.id, name: req.session.passport.user.first_name}
  // }
  var category = req.params.category;
  console.log(category);
  if(typeof category == 'undefined'){
  	console.log('invalid params')
    // res.render('t_pcategory.ejs',{data: []});
  }else{
  	var modified_category = category.split('_').join(' ')
  	console.log(modified_category);
  	client.query('SELECT * from products where category = $1', [modified_category], function (err, result) {
    	if(err) { console.log('error');return next(err)}
    	var items = result.rows
      if(req.isAuthenticated()){
  		  res.render('t_pcategory.ejs',{data: items, category: modified_category, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name});
      }
      else{
       res.render('t_pcategory.ejs',{data: items, category: modified_category}); 
      }
  	})
  }
});

 module.exports = router
