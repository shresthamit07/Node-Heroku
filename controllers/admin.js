var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var session = require('express-session');
var app = module.exports = express();
var moment = require('moment');

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
	// res.render('a_index.ejs');
	//display today's order
})

//display all orders
router.get('/orders', function(req, res) {// render the page and pass in any flash data if it exists
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
					console.log(item_results)
					if(item_results != undefined & item_results.length > 0){
						id_wise_item_hash = id_associated_orders_item(item_results)
						total_amount_hash = get_total_amount_per_order(id_wise_item_hash)
						console.log(total_amount_hash)

						res.render('a_orders', {orders: results, moment: moment, order_items: id_wise_item_hash, total_amount: total_amount_hash});
					}else{
						res.render('a_orders', {orders: []});		
					}
				})
			}else{
				res.render('a_orders', {orders: []});
			}
		});
});

// returns hash {'1' => [orders with id 1], '2'=> [orders with id 2]}
var id_associated_orders_item = function(data){
	console.log(data.length)
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
	console.log(data);

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