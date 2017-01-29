
var express = require('express');
var flash = require('connect-flash');
var app = module.exports = express();
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
    cookie : { secure : false, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours 
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
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/test';

const client = new pg.Client(connectionString);
client.connect();

// // Your database configuration
var DATABASE_URL = 'postgres://postgres:testpassword@localhost/test';



// app.get('/', (req, res, next) => {
//   const results = [];
//   // Get a Postgres client from the connection pool
//   pg.connect(connectionString, (err, client, done) => {
//     // Handle connection errors
//     if(err) {
//       done();
//       console.log(err);
//       return res.status(500).json({success: false, data: err});
//     }
//     // SQL Query > Select Data
//     const query = client.query('SELECT cust_id, cust_name FROM cust ORDER BY cust_id ASC;');
//     // Stream results back one row at a time
//     query.on('row', (row) => {
//       results.push(row);
//     });
//     // After all data is returned, close connection and return results
//     query.on('end', () => {
//       done();
//       // return res.json(results);
//       res.render(path + 'index', {data: results});
//     });
//   });
// });

// app.get('/register', function(req, res) {
//         // render the page and pass in any flash data if it exists
//         res.render(path + 't_register');
//     });

// app.post('/register', function(req, res) {
// 	const results = [];
// 	console.log(req.body)
//   // Grab data from http reques
//         res.render(path + 't_register');
//     });

app.get('/design', function(req, res){
	res.render(path + 't_index');
});

app.listen(3000, function() {
  console.log('listening on 3000')
});
