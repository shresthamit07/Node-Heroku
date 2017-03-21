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

// var readHTMLFile = fs.readFile(contact_message_template, {encoding: 'utf-8'});

router.get('/contact_us', function(req, res, next) {
	res.render('t_contact');
})

router.post('/contact_message', function(req, res) {
	// res.send({data: req.body})
	// console.log(req);
	// console.log(JSON.parse(req.body))
	var transport = nodemailer.createTransport({
					service: 'gmail',
					auth: {
					user: 'liquorzone.owner@gmail.com',
					pass: 'liquorzone07'
					}
					});
	var data = [{name: 'abc'}, {name: 'apple'}]
	// console.log(readHTMLFile)
		ejs.renderFile(contact_message_template, {data}, (err, html) => {
					      if (err) console.log(err); // Handle error

					      transport.sendMail({
					      	from: 'liquorzone.owner@gmail.com',
					      	to: 'liquorzone.owner@gmail.com',
					      	subject: 'EJS Admin Test File',
					        html: html
					      })
					    });

	// 	      transport.sendMail({
	// 	      	from: 'liquorzone.owner@gmail.com',
	// 	      	to: 'liquorzone.owner@gmail.com',
	// 	      	subject: 'Customer Message',
	// 	        html: text
	// 	      })
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
      		res.render('t_search_result.ejs',{data: items, search_param: query_param, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
      }
      else{
      res.render('t_search_result.ejs',{data: items, search_param: query_param, session: req.isAuthenticated(), url: req.url});
      }
	})
})

module.exports = router