
var express = require('express');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var app = module.exports = express();
app.use(cookieParser());
var session = require('express-session');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var moment = require('moment');
app.use(flash());
var bodyParser = require('body-parser');
var validator = require('express-validator');
app.use(bodyParser());
app.use(validator());

app.use(session({ secret: 'anything',
    resave: true,
    saveUninitialized: true,
    cookie : {httpOnly: false, secure : false, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours 
}));

//'uniq_user_id': parseInt(new Date().getTime() + Math.random())
var path = __dirname + '/views/';
var passport = require('passport');
var flash    = require('connect-flash');

app.use(express.static(__dirname + '/public'));

app.use(passport.initialize());
app.use(passport.session());

app.use(require('./controllers'))


// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(flash());
app.use(express.static(__dirname + '/public'));


const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

const client = new pg.Client(connectionString);
const client1 = new pg.Client(connectionString);
client.connect();
client1.connect();

// // Your database configuration
var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';

app.locals = {
    p_category: {
        names: get_pcategory()
    },
    p_country: {
        countries: get_countries()
    },
    p_type: {
        types: get_ptypes()
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
function get_countries(){
    c_results = []

    var query = client1.query('SELECT DISTINCT LOWER(country) from products');
    query.on("row", function (result) {
        c_results.push(result);
    });

    query.on("end", function (results) {
        client.end();
    });
    return c_results;
};

function get_ptypes(){
    t_results = []
    var query = client1.query('SELECT DISTINCT type from products');
    query.on("row", function (result) {
        t_results.push(result);
    });

    query.on("end", function (results) {
        client.end();
    });
    return t_results;

}

app.get('/design', function(req, res){
    // res.clearCookie("item_details");
	res.render(path + 'index');
});

app.listen(3000, function() {
  console.log('listening on 3000')
});
