var express = require('express')
  , router = express.Router()

router.use(require('./users'))
router.use(require('./products'))
router.use(require('./email_handler'))
router.use(require('./orders'))
router.use(require('./liquorzone'))
router.use(require('./admin'))
router.use(require('./recommendation'))

var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

var client = new pg.Client(connectionString);
client.connect();

// var client1 = new pg.Client(connectionString);
// client1.connect();

router.get('/', function(req, res) {

  if(req.user != undefined && req.user.is_admin){
    console.log('admin here.')
    res.redirect('/admin')
    // res.render('admin_template_design.ejs');
  }else{
  	console.log("session_passport")
  	console.log(req.session);
  	var params = {data: []}
  	var items = [];
  	client.query('SELECT * from products order by id desc LIMIT 40', function (err, result) {
     	if(err) { console.log('error');}
        	items = result.rows
        	console.log("session auth" + req.isAuthenticated());
          if(req.isAuthenticated()){
            client.query('SELECT * from products p inner join recommendations r on (r.products_id = p.id and r.users_id = $1) order by r.weighted_score desc', [req.user.id], function(err, r_result){
              recommended_items = r_result.rows;
            // client.query('SELECT * from products where id in (SELECT products_id from recommendations where users_id = $1 order by weighted_score desc)',[req.user.id], function (err, r_result) {
              client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
              if(recommended_items.length > 0){
      		      res.render('t_index.ejs',{data: items, recommended_items: recommended_items, ratings: ratings_in_hash_format, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name});
              }else{
                // client.query('SELECT * from products where id in(SELECT products_id from products_purchase order by purchase_count desc LIMIT 10)', function (err, r_result) {
                  client.query('select p.*, a.products_id, a.purchase_count from products p inner join products_purchase a on (a.products_id = p.id) order by a.purchase_count desc', function (err, r_result) {
                  recommended_items = r_result.rows;   
                  res.render('t_index.ejs',{data: items, recommended_items: recommended_items, ratings: ratings_in_hash_format, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name}); 
               })
              }
            })
            })
          }
          else{
            //most purchased item
            // client.query('SELECT * from products where id in(SELECT products_id from products_purchase order by purchase_count desc LIMIT 10)', function (err, r_result) {
            client.query('select p.*, a.products_id, a.purchase_count from products p inner join products_purchase a on (a.products_id = p.id) order by a.purchase_count desc', function (err, r_result) {
              recommended_items = r_result.rows;
              client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)

              res.render('t_index.ejs',{data: items, recommended_items: recommended_items, ratings: ratings_in_hash_format, session: req.isAuthenticated()});
            })
            })
          }

  	});
  }
 

  //working code


	// if(!isEmpty(req.session.passport)){
	// 	params = {data: [], session: true, id: req.session.passport.user.id, name: req.session.passport.user.first_name}
	// }

	//end of working code
  // res.render('index', params);
})


var get_rating_hash = function(data){
  var rating_hash  = {};
  var average_rating_hash = {}
  for(var i = 0, l = data.length; i < l; i++) {
    var p_id = data[i].products_id;
    if(rating_hash[p_id] != undefined){
      rating_hash[p_id].push(data[i].r_value);
    }else{
      rating_hash[p_id] = [data[i].r_value] || 0;
    }
  }

  for(product in rating_hash){
    var sum = 0;
    for( var i = 0; i < rating_hash[product].length; i++ ){
      sum += parseInt( rating_hash[product][i], 10 ); //don't forget to add the base
    }

    var avg = sum/rating_hash[product].length;
    average_rating_hash[product] = Math.round(avg)
  }
  return average_rating_hash

};

var isEmpty = function(obj) { 
   for (var x in obj) { return false; }
   return true;
}

module.exports = router
