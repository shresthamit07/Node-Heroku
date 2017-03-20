var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var session = require('express-session');
var app = module.exports = express();

const ejs = require('ejs');
const nodemailer = require('nodemailer');
const customer_template = './views/customer_template_design.ejs';
const admin_template = './views/admin_template_design.ejs';

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
	    	console.log(order_items)
	    	if(order_items != undefined){
	    		for(var i = 0; i < order_items.length;i++){
			    	var query1 = client.query('INSERT INTO orders_products(orders_id, products_id, products_name, products_price, quantity, image, volume) values($1, $2, $3, $4, $5, $6, $7)',
			    	[row.id, order_items[i].id, order_items[i].name, order_items[i].price, order_items[i].qty, order_items[i].image, order_items[i].volume]);
			    	query1.on('error', function(err) {
		  				console.log('Query error: ' + err);
		  				return res.render('t_checkout', {error_msg: 'Something went wrong. Try again!'});
					});
			    }

			    var query2 = client.query('SELECT email from users where is_admin is True');
				query2.on("row", function (row, result) {
					console.log('.....')
					console.log(row.email)
					console.log('.....')
					//send email
					var transport = nodemailer.createTransport({
					service: 'gmail',
					auth: {
					user: 'liquorzone.owner@gmail.com',
					pass: 'liquorzone07'
					}
					});


					// for customer
					ejs.renderFile(customer_template, (err, html) => {
					      if (err) console.log(err); // Handle error

					      console.log(`HTML: ${html}`);

					      transport.sendMail({
					      	from: 'liquorzone.owner@gmail.com',
					      	to: 'liquorzone.owner@gmail.com',
					      	subject: 'EJS Customer Test File',
					        html: html
					      })
					    });

					// for admin
					ejs.renderFile(admin_template, (err, html) => {
					      if (err) console.log(err); // Handle error

					      console.log(`HTML: ${html}`);

					      transport.sendMail({
					      	from: 'liquorzone.owner@gmail.com',
					      	to: row.email,
					      	subject: 'EJS Admin Test File',
					        html: html
					      })
					    });
					// end of email sending

				});
			}
			res.clearCookie('item_details');
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

	ejs.renderFile(customer_template, (err, html) => {
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