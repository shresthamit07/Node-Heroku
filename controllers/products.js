var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var session = require('express-session');
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
  var items = [];
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
    	items = result.rows
      if(req.isAuthenticated()){
  		  res.render('t_pcategory.ejs',{data: items, category: modified_category, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
      }
      else{
       res.render('t_pcategory.ejs',{data: items, category: modified_category, url: req.url}); 
      }
  	})
  }
});

router.post('/products/add_to_cart', function(req, res){
  var items = JSON.parse(req.body.data);
  res.cookie('item_details' , items, { expires: new Date(Date.now() + 60000), httpOnly: false }).send('Cookie is set');
});

router.post('/products/delete_from_cart', function(req, res){
  var items_in_cart = []
  var items_to_delete = JSON.parse(req.body.data);
  if(req.cookies.item_details != undefined){
    items_in_cart = req.cookies.item_details;
    items_in_cart = items_in_cart.filter(function( obj ) {
      return obj.id !== items_to_delete;
    });

  }
  console.log('later')
  console.log(items_in_cart)
  res.cookie('item_details' , items_in_cart, { expires: new Date(Date.now() + 60000), httpOnly: false }).send('Cookie is set');
});

router.get('/mycart', function(req, res, next){
  var cart_items = [];
  console.log(cart_items);
  if(req.cookies.item_details != undefined){
    cart_items = req.cookies.item_details
  }

  if(req.isAuthenticated()){
    res.render('t_cartview.ejs', {data: cart_items, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name});
  }
  else{
    console.log(cart_items)
    res.render('t_cartview.ejs', {data: cart_items});
  }
})


// var get_localdata = function(){
//   if (typeof localStorage === "undefined" || localStorage === null) {
//   var LocalStorage = require('node-localstorage').LocalStorage;
//   localStorage = new LocalStorage('./scratch');
// }
//   var data = JSON.parse(localStorage.getItem('cart_details'));
//   console.log(data);
//   if(!data){
//       ids = [];
//   }else{
//     ids = data.ids;
//   }
//   return ids;
// }

 module.exports = router
