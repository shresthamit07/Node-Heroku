// var express = require('express');
// var app = express();

// app.get('/', function(req, res) {

// 	var sql = 'SELECT * FROM cust';
//   	postgres.client.query(sql, function(err, results) {
//     if (err) {
//       console.error(err);
//       res.statusCode = 500;
//       return res.json({ errors: ['Could not retrieve customers'] });
//     }
//     res.json(result.rows[0]);
//     console.log(result.rows[0]);
//  })
//   // We must end the request when we are done handling it
//   res.end();
// });

// var testRouter = express.Router();
// // A GET to the root of a resource returns a list of that resource
// testRouter.get('/', function(req, res) {
// 	var sql = 'SELECT * FROM cust';
//   	postgres.client.query(sql, function(err, results) {
//     if (err) {
//       console.error(err);
//       res.statusCode = 500;
//       return res.json({ errors: ['Could not retrieve customers'] });
//     }
//     res.json(result.rows[0]);
//     console.log(result.rows[0]);
//  })
//   });

// // A POST to the root of a resource should create a new object
// testRouter.post('/', function(req, res) { });

// // We specify a param in our path for the GET of a specific object
// testRouter.get('/:id', function(req, res) { });

// // Similar to the GET on an object, to update it we can PATCH
// testRouter.patch('/:id', function(req, res) { });

// // Delete a specific object
// testRouter.delete('/:id', function(req, res) { });
// // Attach the routers for their respective paths

// app.use('/login', testRouter);

// module.exports = app;
