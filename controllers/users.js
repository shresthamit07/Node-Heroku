
var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var app = module.exports = express();
var session = require('express-session');
var flash = require('connect-flash');
var bcrypt = require('bcrypt');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
 var moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());

var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

var client = new pg.Client(connectionString);
client.connect();

router.get('/register', function(req, res) {// render the page and pass in any flash data if it exists
	res.render('t_register');
});

router.post('/register', function(req, res) {
	var results = [];
	var name = req.body.first_name;

	//validate the presence of every field
	req.checkBody('first_name', 'First Name is required').notEmpty();
	req.checkBody('last_name', 'Last Name is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('m_number', 'Phone number is required').notEmpty();
	req.checkBody('address', 'Address is required').notEmpty();

	var errors = req.validationErrors();
	if(errors){
		console.log(errors)
		res.render('t_register', {errors: errors})
	}
	else{
	  var user = req.body;
	  var hashed_pwd = bcrypt.hashSync(user.password, 10);
	  console.log(hashed_pwd);

	    // SQL Query > Insert Data
	    var query = client.query('INSERT INTO users(first_name, last_name, email, password, phone, address) values($1, $2, $3, $4, $5, $6)',
	    [user.first_name, user.last_name, user.email, hashed_pwd, user.m_number, user.address]);	
	    query.on('error', function(err) {
  			console.log('Query error: ' + err.code);
  			return res.render('t_register', {error_msg: 'User already exists.'});

			});
			query.on('end', function(){
				res.redirect('/login');
				// req.flash('success_msg', 'You are registered and can now login')
			})  
			// res.redirect('/login');
	 }
});



router.post('/update', function(req, res) {
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
		res.render('t_register', {errors: errors})
	}
	else{

	  var user = req.body;
	    client.query('UPDATE users SET first_name=($1), last_name=($2), phone=($3), address=($4) where email=($5)',[user.first_name, user.last_name, user.m_number, user.address, req.user.email]);
	    res.redirect('/profile')
	 }
});

router.get('/login', function(req, res, next) {
	console.log(req.user)
	console.log(req.isAuthenticated());
	if(req.isAuthenticated()){
		if(req.user.is_admin)
		{
			console.log('admin')
			return res.render('t_index.ejs', {data: [], session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name})
		}else{
			return res.render('t_index.ejs', {data:[], session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name})
		}
	}
	else{
		return res.render('t_login.ejs');
	}(req, res, next);
});


router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//login post request
router.post('/login',
  passport.authenticate('local', {	successRedirect: '/',
                                  	failureRedirect: '/login',
                                  })
);


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
	usernameField: 'email',
    passwordField: 'password'
},
  function(username, password, done) {
    client.query('SELECT * from users where email = $1', [username], function (err, result) {
    	if(err) { console.log('error');return next(err)}
    	var user = result.rows
    	//user is not found
    	if(!user.length){
    		console.log('user not found');
    		return done(null, false, { message: 'Incorrect username.' });
    	}
    	//user is found
    	else{
    		console.log('user email found')
    		if(validPassword(password, user[0].password)){
    			console.log('valid password');
    			return done(null, user[0]);
    		}else{
    			console.log('Invalid Username/password');
    			return done(null, false, { message: 'Incorrect password.' });
    		}
    	}
    });
  }
));

var validPassword = function(password, hashFromDB){
	console.log(password);
	return bcrypt.compareSync(password, hashFromDB);
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user)
});

//end of login post request

router.get('/api', function(req, res) {// render the page and pass in any flash data if it exists
	var fs = require('fs');
	var csv = require("fast-csv");
	fs.createReadStream("merlot_wines.csv")
    .pipe(csv({ headers : true }))
    .on("data", function(data){
    	insert_item(data);

    })
    .on("end", function(){
        console.log("done");
        return;
    });
});

router.get('/profile', function(req, res) {// render the page and pass in any flash data if it exists
	if(req.isAuthenticated()){
		// res.render('t_profile');
		var user_email = req.user.email
		var query = client.query("SELECT * from users where email = $1", [user_email],function(err, result){
			var profile_details = result.rows;
			console.log('*******')
			console.log(profile_details[0]);
			res.render('t_profile.ejs', {data: profile_details[0], session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name})
		});
	}else{
		res.render('t_login');
	}
	
});


router.get('/order_history', function(req, res) {// render the page and pass in any flash data if it exists
	var results = [];
	var id_wise_item_hash = {};
	var total_amount_hash = {};
	if(req.isAuthenticated()){
		user_email = req.user.email;
		console.log(user_email)
		var query = client.query("SELECT * from orders where email = $1", [user_email],function(err, result){
			if(err) { console.log('error');return next(err)}
			results = result.rows
			if(results != undefined & results.length > 0){
				var ids = results.map(function(a) {return a.id;});
				var query1 = client.query("SELECT * from orders_products where orders_id = ANY (select id from orders where email = $1)", [user_email], function(err1, i_result){
					var item_results = i_result.rows
					if(item_results != undefined & item_results.length > 0){
						id_wise_item_hash = id_associated_orders_item(item_results)
						total_amount_hash = get_total_amount_per_order(id_wise_item_hash)
						console.log(total_amount_hash)
						res.render('t_order_history', {orders: results, moment: moment, order_items: id_wise_item_hash, total_amount: total_amount_hash, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name});
					}else{
						res.render('t_order_history', {orders: [], session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name});		
					}
				})
			}else{
				res.render('t_order_history', {orders: [], session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name});
			}
		});
	}else{
		res.render('t_login.ejs');
	}
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

var insert_item = function(row){
	var query = client.query('INSERT INTO products(name, description, sku, country, category, type, price, quantity, image, volume) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
	    [row.name, row.description, row.sku, row.country, row.category, row.type, row.price, row.quantity, row.image, row.volume]);	
}

 module.exports = router