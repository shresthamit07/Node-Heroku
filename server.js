
var express = require('express');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var app = module.exports = express();
app.use(cookieParser());
var session = require('express-session');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

app.use(flash());
var bodyParser = require('body-parser');
var validator = require('express-validator');
app.use(bodyParser());
app.use(validator());

app.use(session({ secret: 'anything',
    resave: true,
    saveUninitialized: true,
    cookie : {'uniq_user_id': parseInt(new Date().getTime() + Math.random()), httpOnly: false, secure : true, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours 
}));

app.use(passport.initialize());
app.use(passport.session());

var path = __dirname + '/views/';
var passport = require('passport');
var flash    = require('connect-flash');

app.use(require('./controllers'))


// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(flash());
app.use(express.static(__dirname + '/public'));


const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

const client = new pg.Client(connectionString);
client.connect();

// // Your database configuration
var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';

app.locals = {
    p_category: {
        names: get_pcategory()
    }
};

function get_pcategory(){
	results = []

	var query = client.query('SELECT DISTINCT category from products');
	query.on("row", function (result) {
    	results.push(result);
	});

	query.on("end", function (results) {
    	client.end();
	});
	return results;
};

app.get('/design', function(req, res){
    res.clearCookie("item_details");
	res.render(path + 't_index');
});

app.listen(3000, function() {
  console.log('listening on 3000')
});
