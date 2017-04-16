var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var session = require('express-session');
var app = module.exports = express();
var moment = require('moment');

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
	if(req.user != undefined && req.user.is_admin){
    console.log('admin here.')
    res.redirect('/admin')
  }else{
	res.render('t_checkout');
}
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
	    			console.log('entered')	    	
	    			update_purchase_product_db(order_items[i]);
	    			update_quantity(order_items[i])
	    			if(req.isAuthenticated()){
	    				insert_default_rating(order_items[i], req.user.id);
	    			}
			    	var query1 = client.query('INSERT INTO orders_products(orders_id, products_id, products_name, products_price, quantity, image, volume) values($1, $2, $3, $4, $5, $6, $7)',
			    	[row.id, order_items[i].id, order_items[i].name, order_items[i].price, order_items[i].qty, order_items[i].image, order_items[i].volume]);
			    	query1.on('error', function(err) {
		  				console.log('Query error: ' + err);
		  				return res.render('t_checkout', {error_msg: 'Something went wrong. Try again!'});
					});
			    }
			    send_email(row.id);
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

var send_email = function(order_id){
	var results = [];
	var receivers = ['liquorzone.owner@gmail.com'];
	var id_wise_item_hash = {};
	var total_amount_hash = {};
	var query = client.query("SELECT * from orders where id = $1", [order_id],function(err, result){
			if(err) { console.log('error');return next(err)}
			results = result.rows
			if(results != undefined & results.length > 0){
				var query1 = client.query("SELECT * from orders_products where orders_id = $1", [order_id], function(err1, i_result){
					var item_results = i_result.rows
					if(item_results != undefined & item_results.length > 0){
						id_wise_item_hash = id_associated_orders_item(item_results)
						total_amount_hash = get_total_amount_per_order(id_wise_item_hash)

					var query2 = client.query('SELECT email from users where is_admin is True', function(err, e_result){
						receivers.push(e_result.rows)
					});
					receivers.push(results[0].email)
					var transport = nodemailer.createTransport({
					service: 'gmail',
					auth: {
					user: 'liquorzone.owner@gmail.com',
					pass: 'liquorzone07'
					}
					});
					ejs.renderFile(admin_template, {orders: results, moment: moment, order_items: id_wise_item_hash, total_amount: total_amount_hash}, (err, html) => {
					      if (err) console.log(err); // Handle error

					      transport.sendMail({
					      	from: 'liquorzone.owner@gmail.com',
					      	to: receivers,
					      	subject: 'New order has been placed.',
					        html: html
					      })
					    });
					}
				});
			}
	});
};

var update_purchase_product_db = function(data){
	console.log('entered twice')
	var insert_new = true;
	var query3 = client.query("UPDATE products_purchase SET purchase_count = purchase_count + $1 WHERE products_id=$2  Returning *", [data.qty, data.id],function(err, result){
		var results = result.rows;
		if(results.length == 0){
			var query4 = client.query("INSERT into products_purchase(products_id, purchase_count, category) values ($1, $2, $3)", [data.id, data.qty, data.category])
			query4.on('error', function(err) {
				console.log('Query error: ' + err);
			});

			query4.on('row', function(result) {
				console.log('success');

			});
		}
	})
}

var insert_default_rating = function(data, user_id){
	console.log(data.id)
	var query5 = client.query("INSERT into ratings(products_id, users_id, r_value) values ($1, $2, $3)", [data.id, user_id, 4])
		query5.on('error', function(err) {
			console.log('Query error: ' + err);
		});

		query5.on('row', function(result) {
			console.log('Inserted into rating table.');

		});
}

var update_quantity = function(data){
	console.log('quantity')
	console.log(data.id);
	var query6 = client.query("UPDATE products SET quantity = quantity - $1 WHERE id=$2", [data.qty, data.id],function(err, result){
		query6.on('error', function(err) {
			console.log('Query error: ' + err);
		});

		query6.on('row', function(result) {
			console.log('Updated products table.');

		});
	})
}

// returns hash {'1' => [orders with id 1], '2'=> [orders with id 2]}
var id_associated_orders_item = function(data){
	var orders_hash  = {};
	for(var i = 0, l = data.length; i < l; i++) {
		var order_id = data[i].orders_id;
		if(orders_hash[order_id] != undefined){
			orders_hash[order_id].push(data[i]);
		}else{
			orders_hash[order_id] = [data[i]];
		}
	}
	return orders_hash

};

var get_total_amount_per_order = function(data){
	var total_hash  = {};

	Object.keys(data).forEach(function (key) {
		var total_amount = 0;
		for(var j = 0, l = data[key].length; j < l; j++) {
			var price = data[key][j].products_price;
			var qty= data[key][j].quantity;
			total_amount = total_amount + (price * qty);
		}
		total_hash[key] = total_amount 
	})
	return total_hash
}

 module.exports = router