var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var fs = require('fs');
var session = require('express-session');
var app = module.exports = express();

var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

var client = new pg.Client(connectionString);
client.connect();

const ejs = require('ejs');
const nodemailer = require('nodemailer');
const contact_message_template = './views/contact_message_design.ejs';

router.get('/contact_us', function(req, res, next) {
	res.render('t_contact');
})

router.post('/contact_message', function(req, res) {
	var transport = nodemailer.createTransport({
					service: 'gmail',
					auth: {
					user: 'liquorzone.owner@gmail.com',
					pass: 'liquorzone07'
					}
					});
	var data = [req.body]
		ejs.renderFile(contact_message_template, {data}, (err, html) => {
					      if (err) console.log(err); // Handle error

					      transport.sendMail({
					      	from: 'liquorzone.owner@gmail.com',
					      	to: 'liquorzone.owner@gmail.com',
					      	subject: 'EJS Admin Test File',
					        html: html
					      })
					    });
    res.redirect('/contact_us');
});

router.get('/about_us', function(req, res, next) {
	res.render('t_about_us');
})

router.get('/search', function(req, res) {
	console.log(req.query.query)
	var items = [];
	var query_param = req.query.query;
	var query = client.query("SELECT * from products where (name || country || description || type || category || price || volume) ILIKE $1 limit 10", ['%'+query_param+'%'],function(err, result){
    	items = result.rows
      if(req.isAuthenticated()){
      	client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
      		res.render('t_search_result.ejs',{data: items, ratings: ratings_in_hash_format, search_param: query_param, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
		})      
      }
      else{
      	client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
      res.render('t_search_result.ejs',{data: items, ratings: ratings_in_hash_format, search_param: query_param, session: req.isAuthenticated(), url: req.url});
      })
      }
	})
})

router.get('/search/products', function(req, res) {
	console.log(req.query.c)
	var items = [];
	var search_param = req.query.query;
	var country_param = req.query.c;
	var price_param = req.query.p;
	if(country_param != undefined){
		var query = client.query("SELECT * from products where LOWER(country)=$1 limit 10", [country_param],function(err, result){
    	items = result.rows	
    	if(req.isAuthenticated()){
	      	res.render('t_search_result.ejs',{data: items, search_param: search_param, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
	      }
	      else{
	      	// client.query('select p.*, a.products_id, a.purchase_count from products p inner join products_purchase a on (a.products_id = p.id) order by a.purchase_count desc AND LOWER(country)=$1',[country_param], function (err, r_result) {
        //       recommended_items = r_result.rows;
              res.render('t_products.ejs',{data: items, search_param: search_param, session: req.isAuthenticated(), url: req.url});
            // })
	      	// res.render('t_search_result.ejs',{data: items, search_param: search_param, session: req.isAuthenticated(), url: req.url});
	      }
    	})	
	}else if(price_param != undefined){
		var p1=price_param.split(',');
		var query = client.query("select * from products where price >= $1 and price < $2 limit 10", [p1[0], p1[1]],function(err, p_result){
    	items = p_result.rows
    	if(req.isAuthenticated()){
	      	res.render('t_search_result.ejs',{data: items, search_param: search_param, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
	      }
	      else{
	      	// client.query('select p.*, a.products_id, a.purchase_count from products p inner join products_purchase a on (a.products_id = p.id) order by a.purchase_count desc', function (err, r_result) {
        //       recommended_items = r_result.rows;
              res.render('t_products.ejs',{data: items, search_param: search_param, session: req.isAuthenticated(), url: req.url});
            // })
	      	// res.render('t_search_result.ejs',{data: items, search_param: search_param, session: req.isAuthenticated(), url: req.url});
	      }
    	})
	}else{

		var query = client.query("SELECT * from products where LOWER(name || country || description || type || category || price || volume) ILIKE $1 limit 10", ['%'+search_param+'%'],function(err, s_result){
	    	items = s_result.rows
	  
      if(req.isAuthenticated()){
	      	res.render('t_search_result.ejs',{data: items, search_param: search_param, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
	      }
	      else{
	      	// client.query('select p.*, a.products_id, a.purchase_count from products p inner join products_purchase a on (a.products_id = p.id) order by a.purchase_count desc', function (err, r_result) {
        //       recommended_items = r_result.rows;
              res.render('t_products.ejs',{data: items, search_param: search_param, session: req.isAuthenticated(), url: req.url});
            // })
	      	// res.render('t_search_result.ejs',{data: items, search_param: search_param, session: req.isAuthenticated(), url: req.url});
	      }
	    })
	}
})

router.get('/products', function(req,res){
  	var items = [];
  	client.query('SELECT * from products LIMIT 10', function (err, result) {
     	if(err) { console.log('error');return next(err)}
        	items = result.rows
          if(req.isAuthenticated()){
          	client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
      		  res.render('t_products.ejs',{data: items, ratings: ratings_in_hash_format, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
      		})
          }
          else{
          	//most purchased item
            client.query('select p.*, a.products_id, a.purchase_count from products p inner join products_purchase a on (a.products_id = p.id) order by a.purchase_count desc', function (err, r_result) {
            	client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
              recommended_items = r_result.rows;
              res.render('t_products.ejs',{data: items, recommended_items: recommended_items, ratings: ratings_in_hash_format, session: req.isAuthenticated(), url: req.url});
            })
            })
           // res.render('t_products.ejs',{data: items, session: req.isAuthenticated(), url: req.url}); 
          }

  	});
});

var get_rating_hash = function(data){
  var rating_hash  = {};
  var average_rating_hash = {}
  for(var i = 0, l = data.length; i < l; i++) {
    var p_id = data[i].products_id;
    if(rating_hash[p_id] != undefined){
      rating_hash[p_id].push(data[i].r_value);
    }else{
      rating_hash[p_id] = [data[i].r_value] || 0;
    }
  }

  for(product in rating_hash){
    var sum = 0;
    for( var i = 0; i < rating_hash[product].length; i++ ){
      sum += parseInt( rating_hash[product][i], 10 ); //don't forget to add the base
    }

    var avg = sum/rating_hash[product].length;
    average_rating_hash[product] = Math.round(avg)
  }
  return average_rating_hash

};

module.exports = router