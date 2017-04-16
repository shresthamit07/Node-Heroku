var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var session = require('express-session');
var app = module.exports = express();
var moment = require('moment');

var fs = require('fs-extra');

var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

var client = new pg.Client(connectionString);
client.connect();

router.get('/admin',function(req, res){
	if(req.user != undefined && req.user.is_admin){
		// client.query('select * from orders where created_at = $1')
		var today_date = moment().format('MM-DD-YYYY');
		var query = client.query("SELECT * from orders where CAST(created_at as DATE) = $1 order by created_at desc", [today_date],function(err, result){
			var items = result.rows
			// console.log(items);
			if(items != undefined & items.length > 0){
				var ids = items.map(function(a) {return a.id;});
				var query1 = client.query("SELECT * from orders_products where orders_id = ANY (SELECT id from orders where CAST(created_at as DATE) = $1)", [today_date], function(err1, i_result){
					var item_results = i_result.rows
					console.log(item_results)
					if(item_results != undefined & item_results.length > 0){
						id_wise_item_hash = id_associated_orders_item(item_results)
						total_amount_hash = get_total_amount_per_order(id_wise_item_hash)
						console.log(total_amount_hash)
						res.render('a_index', {orders: items, moment: moment, order_items: id_wise_item_hash, total_amount: total_amount_hash});
					}else{
						res.render('a_index', {orders: []});		
					}
				})
			}else{
				res.render('a_index', {orders: []});
			}
		})
	}
	else{
		res.render('404')
	}
})

//display all orders
router.get('/admin/orders', function(req, res) {// render the page and pass in any flash data if it exists
	if(req.user != undefined && req.user.is_admin){
	var results = [];
	var id_wise_item_hash = {};
	var total_amount_hash = {};
		var query = client.query("SELECT * from orders order by created_at desc limit 10",function(err, result){
			if(err) { console.log('error');return next(err)}
			results = result.rows
			if(results != undefined & results.length > 0){
				var ids = results.map(function(a) {return a.id;});
				var query1 = client.query("SELECT * from orders_products where orders_id = ANY (select id from orders order by created_at desc limit 10)", function(err1, i_result){
					var item_results = i_result.rows
					if(item_results != undefined & item_results.length > 0){
						id_wise_item_hash = id_associated_orders_item(item_results)
						total_amount_hash = get_total_amount_per_order(id_wise_item_hash)
						res.render('a_orders', {orders: results, moment: moment, order_items: id_wise_item_hash, total_amount: total_amount_hash});
					}else{
						res.render('a_orders', {orders: []});		
					}
				})
			}else{
				res.render('a_orders', {orders: []});
			}
		});
	}else{
		res.render('404')
	}
});

router.get('/admin/products', function(req, res) {
	if(req.user != undefined && req.user.is_admin){
	var query = client.query("SELECT * from products order by created_at desc limit 30",function(err, result){
			if(err) { console.log('error');return next(err)}
			results = result.rows
			res.render('a_products', {items: results});
		})
	}else{
		res.render('404')
	}
})

router.get('/admin/products/:id', function(req, res) {
	if(req.user != undefined && req.user.is_admin){
	var item_id = req.params.id;
	var query = client.query("SELECT * from products where id =$1", [item_id],function(err, result){
			if(err) { console.log('error');return next(err)}
			results = result.rows
			res.render('a_product_details', {item_details: results[0]});
		})
	}else{
		res.render('404')
	}
})

router.get('/admin/new_product', function(req, res) {
	if(req.user != undefined && req.user.is_admin){
		res.render('a_add_product');
	}else{
		res.render('404')
	}
})

router.post('/admin/new_product', function(req, res) {
	//validate the presence of every field
	req.checkBody('p_name', 'Name is required').notEmpty();
	req.checkBody('p_sku', 'SKU is required').notEmpty();
	req.checkBody('p_category', 'Category is required').notEmpty();
	req.checkBody('p_type', 'Type is required').notEmpty();
	req.checkBody('p_country', 'Country is required').notEmpty();
	req.checkBody('p_price', 'Price is required').notEmpty();
	req.checkBody('p_volume', 'Volume is required').notEmpty();
	req.checkBody('p_qty', 'Quantity is required').notEmpty();
	req.checkBody('p_description', 'Description is required').notEmpty();

	var errors = req.validationErrors();
	if(errors){
		console.log(errors)
		res.render('a_add_product', {errors: errors})
	}
	else{
	  var product = req.body;
	  console.log(product.p_sku)
	  product_sku = product.p_sku;

	  var query1 = client.query("SELECT * from products where sku = $1", [product_sku], function(err, s_result){
	  	if(err) { console.log('error');return next(err)}
	  	console.log(s_result.rows)
		var results = s_result.rows
		if(results.length > 0){
			console.log("Sku already exists")
			return res.render('a_add_product', {error_msg: 'SKU already exists. Try another SKU'});
		}else{
		    var p_image_name = product_sku + ".png"
		    console.log(p_image_name)
		    var query = client.query('INSERT INTO products(name, sku, category, type, country, price, volume, quantity, description, image) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) Returning id',
		    [product.p_name, product.p_sku, product.p_category, product.p_type, product.p_country, product.p_price, product.p_volume, product.p_qty, product.p_description, p_image_name]);	
		    query.on('error', function(err) {
	  			console.log('Query error: ' + err.code);
	  			return res.render('a_add_product', {error_msg: 'Something went wrong.'});

			});
			query.on('row', function(row, result1){
				console.log(row.id)
				var r_path = '/admin/products/'+row.id+'/change_image'
				res.redirect(r_path);
			})  
		}
		})
	}
});

router.post('/admin/products/:id/update', function(req, res) {
	//validate the presence of every field
	req.checkBody('p_name', 'Name is required').notEmpty();
	req.checkBody('p_category', 'Category is required').notEmpty();
	req.checkBody('p_type', 'Type is required').notEmpty();
	req.checkBody('p_country', 'Country is required').notEmpty();
	req.checkBody('p_price', 'Price is required').notEmpty();
	req.checkBody('p_volume', 'Volume is required').notEmpty();
	req.checkBody('p_qty', 'Quantity is required').notEmpty();
	req.checkBody('p_description', 'Description is required').notEmpty();
	var product_id = req.params.id
	var errors = req.validationErrors();
	if(errors){
		console.log(errors)
		res.render('a_add_product', {errors: errors})
	}
	else{
		var product = req.body;
		console.log(product)
		client.query('UPDATE products SET name=($1), category=($2), type=($3), country=($4), price=($5), volume=($6), quantity=($7), description=($8) where id=($9)',[product.p_name, product.p_category, product.p_type, product.p_country, product.p_price, product.p_volume, product.p_qty, product.p_description, product_id]);
		res.redirect('/admin/products')
	}
});

router.get('/admin/products/:id/change_image', function(req, res) {
	if(req.user != undefined && req.user.is_admin){
	var p_id = req.params.id
	var query = client.query("SELECT id, name, image from products where id = $1",[p_id], function(err, i_result){
		if(err) { console.log('error');return next(err)}
			results = i_result.rows
			if(results.length >0){
				res.render('a_product_image', {p_id: results[0].id, name: results[0].name, image: results[0].image})
			}else{
				console.log("Product Doesnot exist.")
				res.redirect('/admin/products')
			}
	})
	}else{
		res.render('404')
	}
})

router.post('/admin/products/:id/change_image', function(req, res) {
	var p_id = req.params.id
	var query = client.query("SELECT * from products where id = $1",[p_id], function(err, p_result){
			if(err) { console.log('error');return next(err)}
			results = p_result.rows
			if(results.length >0){

				req.pipe(req.busboy);
			    req.busboy.on('file', function(fieldname, file, filename) {
			    	console.log(fieldname)
			    	console.log(filename)
			        var fstream = fs.createWriteStream(process.cwd()+'/public/images/liquors/' + results[0].sku+'.png'); 
			        file.pipe(fstream);
			        fstream.on('close', function () {
			            var r_path = '/admin/products/'+p_id
						res.redirect(r_path);
			        });
			    });
			}else{
				console.log("Product Doesnot exist.")
				res.render('a_product_image');
			}
		})
})

router.get('/admin/account', function(req, res) {// render the page and pass in any flash data if it exists
	if(req.user != undefined && req.user.is_admin){
		var user_email = req.user.email
		var query = client.query("SELECT * from users where email = $1", [user_email],function(err, result){
			var profile_details = result.rows;
			res.render('a_account.ejs', {data: profile_details[0], session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name})
		});
	}else{
		res.render('404');
	}
	
});

router.post('/update_account', function(req, res) {
	var results = [];
	var name = req.body.first_name;

	//validate the presence of every field
	req.checkBody('first_name', 'First Name is required').notEmpty();
	req.checkBody('last_name', 'Last Name is required').notEmpty();
	req.checkBody('m_number', 'Phone number is required').notEmpty();
	req.checkBody('address', 'Address is required').notEmpty();

	var errors = req.validationErrors();
	if(errors){
		console.log(errors)
		res.render('a_account', {errors: errors})
	}
	else{

	  var user = req.body;
	    client.query('UPDATE users SET first_name=($1), last_name=($2), phone=($3), address=($4) where email=($5)',[user.first_name, user.last_name, user.m_number, user.address, req.user.email]);
	    res.redirect('/admin/account')
	 }
});

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