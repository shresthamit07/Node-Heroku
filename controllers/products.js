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
  var items = [];
  var category = req.params.category;
  var countries = [];
  console.log(category);
  if(typeof category == 'undefined'){
  	console.log('invalid params')
  }else{
  	var modified_category = category.split('_').join(' ')
  	console.log(modified_category);
    console.log(req.query.c != undefined)
    if(req.query.p != undefined){
      var price_range = req.query.p.split(',')
      console.log(price_range[0])
      client.query('SELECT * from products where category = $1 and (price >= $2 and price < $3)', [modified_category, price_range[0], price_range[1]], function (err, result) {
        if(err) { console.log('error');res.render('404.ejs')}
        items = result.rows
        if(req.isAuthenticated()){
          res.render('t_pcategory.ejs',{data: items, category: modified_category, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
        }
        else{
         res.render('t_pcategory.ejs',{data: items, category: modified_category, url: req.url}); 
        }
      })
    }
    else if(req.query.c != undefined){
      client.query('SELECT * from products where category = $1 and LOWER(country) = $2', [modified_category, req.query.c], function (err, result) {
        if(err) { console.log('error');return next(err)}
        items = result.rows
        if(req.isAuthenticated()){
          res.render('t_pcategory.ejs',{data: items, category: modified_category, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
        }
        else{
         res.render('t_pcategory.ejs',{data: items, category: modified_category, url: req.url}); 
        }
      })
    }else{
    	client.query('SELECT * from products where category = $1', [modified_category], function (err, result) {
      	if(err) { console.log('error');return next(err)}
      	items = result.rows
          if(req.isAuthenticated()){
      		  res.render('t_pcategory.ejs',{data: items, category: modified_category, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
          }
          else{
           res.render('t_pcategory.ejs',{data: items, category: modified_category, url: req.url}); 
          }
        });
    }
  }
});

router.get('/products/:category/:id', function(req, res, next) {
  
  var item_details = [];
  var item_id = req.params.id;
  console.log(item_id);
  if(typeof item_id == 'undefined'){
    console.log('invalid params')
    // res.render('t_pcategory.ejs',{data: []});
  }else{
    client.query('SELECT * from products where id = $1', [item_id], function (err, result) {
      if(err) { console.log('error');return next(err)}
      item_details = result.rows
      if(isEmpty(item_details)){
        res.render('404.ejs');
      }else{
        if(req.isAuthenticated()){
          res.render('t_item_details.ejs',{data: item_details, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
        }
        else{
         res.render('t_item_details.ejs',{data: item_details, url: req.url}); 
        }
      }
    })
  }
});

router.post('/products/add_to_cart', function(req, res){
  var items = JSON.parse(req.body.data);
  res.cookie('item_details' , items, { expires: new Date(Date.now() + 600000), httpOnly: false }).send('Cookie is set');
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
  res.cookie('item_details' , items_in_cart, { expires: new Date(Date.now() + 600000), httpOnly: false }).send('Cookie is set');
});

router.post('/products/update_qty', function(req, res){
  var items = JSON.parse(req.body.data);
  res.cookie('item_details' , items, { expires: new Date(Date.now() + 600000), httpOnly: false }).send('Cookie is set');
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

var isEmpty = function(obj) { 
   for (var x in obj) { return false; }
   return true;
}

 module.exports = router
