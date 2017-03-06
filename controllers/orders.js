var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var session = require('express-session');
var app = module.exports = express();

const ejs = require('ejs');
const nodemailer = require('nodemailer');
const template = './views/design.ejs';

router.get('/checkout', function(req, res, next) {
	res.render('t_checkout');
})

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