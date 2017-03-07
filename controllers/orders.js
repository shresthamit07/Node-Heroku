var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var session = require('express-session');
var app = module.exports = express();

const ejs = require('ejs');
const nodemailer = require('nodemailer');
const template = './views/design.ejs';

var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

var client = new pg.Client(connectionString);
client.connect();


router.get('/checkout', function(req, res, next) {
	res.render('t_checkout');
})

router.post('/checkout', function(req, res) {
	var results = [];

	//validate the presence of every field
	req.checkBody('full_name', 'Full Name is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('m_number', 'Phone number is required').notEmpty();
	req.checkBody('delivery_address', 'Delivery Address is required').notEmpty();
	req.checkBody('cc_number', 'Credit Card Number is required').notEmpty();
	req.checkBody('cc_date', 'Credit Card Expiration Date is required').notEmpty();
	req.checkBody('cc_code', 'Security Code is required').notEmpty();

	var errors = req.validationErrors();
	if(errors){
		console.log(errors)
		res.render('t_checkout', {errors: errors})
	}
	else{
	  var customer = req.body;

	    // SQL Query > Insert Data
	    var query = client.query('INSERT INTO orders(cust_name, email, phone, delivery_address, cc_number, cc_date, cc_code, comments) values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
	    [customer.full_name, customer.email, customer.m_number, customer.delivery_address, customer.cc_number, customer.cc_date, customer.cc_code, customer.comments]);
	    query.on('error', function(err) {
  			console.log('Query error: ' + err);
  			return res.render('t_checkout', {error_msg: 'Something went wrong. Try again!'});

			});
	    query.on("row", function (row, result) {
	    	var order_items = req.cookies.item_details;
	    	if(order_items != undefined){
	    		for(var i = 0; i < order_items.length;i++){
			    	var query1 = client.query('INSERT INTO orders_products(orders_id, products_id, products_name, products_price, quantity, image) values($1, $2, $3, $4, $5, $6)',
			    	[row.id, order_items[i].id, order_items[i].name, order_items[i].price, order_items[i].qty, order_items[i].image]);
			    	query1.on('error', function(err) {
		  				console.log('Query error: ' + err);
		  				return res.render('t_checkout', {error_msg: 'Something went wrong. Try again!'});
					});
				}
			res.clearCookie('item_details');
			}
    	});
			query.on('end', function(result){
				res.redirect('/');
			})  
	 }
});


router.get('/send', function(req, res, next) {
	var transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'liquorzone.owner@gmail.com',
    pass: 'liquorzone07'
  }
});

	ejs.renderFile(template, (err, html) => {
	      if (err) console.log(err); // Handle error

	      console.log(`HTML: ${html}`);

	      transport.sendMail({
	      	from: 'liquorzone.owner@gmail.com',
	      	to: 'liquorzone.owner@gmail.com',
	      	subject: 'EJS Test File',
	        html: html
	      })
	    });
	res.redirect('/');
});
 module.exports = router