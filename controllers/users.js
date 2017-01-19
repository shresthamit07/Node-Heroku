
var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var flash = require('connect-flash');
var bcrypt = require('bcrypt');


 // var db = require('.././db');
var DATABASE_URL = 'postgres://postgres:testpassword@localhost/test';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/test';

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

router.get('/login', function(req, res) {// render the page and pass in any flash data if it exists
 		res.render('t_login.ejs');
 	});

 module.exports = router