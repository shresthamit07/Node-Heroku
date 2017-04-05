var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var session = require('express-session');
var app = module.exports = express();

var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

var client = new pg.Client(connectionString);
client.connect();

router.get('/products/:category', function(req, res, next) {
  var items = [];
  var category = req.params.category;
  var countries = [];
  if(typeof category == 'undefined'){
  	console.log('invalid params')
  }else{
  	var modified_category = category.split('_').join(' ')
    if(req.query.p != undefined){
      var price_range = req.query.p.split(',')
      client.query('SELECT * from products where category = $1 and (price >= $2 and price < $3)', [modified_category, price_range[0], price_range[1]], function (err, result) {
        if(err) { console.log('error');res.render('404.ejs')}
        items = result.rows
        if(req.isAuthenticated()){
          client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
          res.render('t_pcategory.ejs',{data: items, category: modified_category, ratings: ratings_in_hash_format, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
        })
        }
        else{
          client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
         res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, category: modified_category, url: req.url}); 
       })
        }
      })
    }
    else if(req.query.c != undefined){
      client.query('SELECT * from products where category = $1 and LOWER(country) = $2', [modified_category, req.query.c], function (err, result) {
        if(err) { console.log('error');return next(err)}
        items = result.rows
        if(req.isAuthenticated()){
          client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
          res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format,category: modified_category, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
        })
        }
        else{
          client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
         res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, category: modified_category, url: req.url}); 
        })
        }
      })
    }else{
    	client.query('SELECT * from products where category = $1', [modified_category], function (err, result) {
      	if(err) { console.log('error');return next(err)}
      	items = result.rows
        client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
          if(req.isAuthenticated()){
      		  res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, category: modified_category, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
          }
          else{
           res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, category: modified_category, url: req.url}); 
          }
        })
        });
    }
  }
});

router.get('/products/type/:p_type', function(req, res, next) {
  var items = [];
  var pr_type = req.params.p_type;
  var countries = [];
  if(typeof pr_type == 'undefined'){
    console.log('invalid params')
  }else{
    var modified_prtype = pr_type.split('_').join(' ')
    if(req.query.p != undefined){
      var price_range = req.query.p.split(',')
      client.query('SELECT * from products where type = $1 and (price >= $2 and price < $3)', [modified_prtype, price_range[0], price_range[1]], function (err, result) {
        if(err) { console.log('error');res.render('404.ejs')}
        items = result.rows
        if(req.isAuthenticated()){
          client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
          res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, session: req.isAuthenticated(), category: modified_prtype, id: req.user.id, name: req.user.first_name, url: req.url});
        })
        }
        else{
          client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
         res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, category: modified_prtype, url: req.url}); 
        })
        }
      })
    }
    else if(req.query.c != undefined){
      client.query('SELECT * from products where type = $1 and LOWER(country) = $2', [modified_prtype, req.query.c], function (err, result) {
        if(err) { console.log('error');return next(err)}
        items = result.rows
        if(req.isAuthenticated()){
          client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
          res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, session: req.isAuthenticated(), category: modified_prtype, id: req.user.id, name: req.user.first_name, url: req.url});
        })
        }
        else{
          client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
         res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, category: modified_prtype, url: req.url}); 
        })
      }
      })
    }else{
      client.query('SELECT * from products where type = $1', [modified_prtype], function (err, result) {
        if(err) { console.log('error');return next(err)}
        items = result.rows
          if(req.isAuthenticated()){
            client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
            res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, session: req.isAuthenticated(), category: modified_prtype, id: req.user.id, name: req.user.first_name, url: req.url});
          })
          }
          else{
            client.query('SELECT * from ratings', function (err, rate_result) {
                ratings_value = rate_result.rows;
                ratings_in_hash_format = get_rating_hash(ratings_value)
           res.render('t_pcategory.ejs',{data: items, ratings: ratings_in_hash_format, category: modified_prtype, url: req.url}); 
          })
          }
        });
    }
  }
});


router.get('/products/:category/:id', function(req, res, next) {
  
  var item_details = [];
  var item_id = req.params.id;
  console.log(item_id);
  if(typeof item_id == 'undefined'){
    console.log('invalid params')
    // res.render('t_pcategory.ejs',{data: []});
  }else{
    client.query('SELECT * from products where id = $1', [item_id], function (err, result) {
      if(err) { console.log('error');return next(err)}
      item_details = result.rows
      if(isEmpty(item_details)){
        res.render('404.ejs');
      }else{
        //for recommendation
        if(req.isAuthenticated()){
            // client.query('SELECT * from products where id in (SELECT products_id from recommendations where users_id = $1 order by weighted_score desc)',[req.user.id], function (err, r_result) {
              client.query('SELECT * from products p inner join recommendations r on (r.products_id = p.id and r.users_id = $1) order by r.weighted_score desc', [req.user.id], function(err, r_result){
              recommended_items = r_result.rows;
              client.query('SELECT * from ratings order by created_at desc', function (err, rate_result) {
                ratings_value = rate_result.rows;
                rating_details = get_rating_for_particular_product(item_id, ratings_value)
                ratings_in_hash_format = get_rating_hash(ratings_value)
              if(recommended_items.length > 0){
                res.render('t_item_details.ejs',{data: item_details, ratings: ratings_in_hash_format, recommended_items: recommended_items, rating_details: rating_details, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
              }else{
                client.query('select p.*, a.products_id, a.purchase_count from products p inner join products_purchase a on (a.products_id = p.id) order by a.purchase_count desc', function (err, r_result) {
                  recommended_items = r_result.rows;   
                  res.render('t_item_details.ejs',{data: item_details, ratings: ratings_in_hash_format, recommended_items: recommended_items, rating_details: rating_details, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name, url: req.url});
               })
              }
              })
            })
        }else{
          client.query('select p.*, a.products_id, a.purchase_count from products p inner join products_purchase a on (a.products_id = p.id) order by a.purchase_count desc', function (err, r_result) {
                  recommended_items = r_result.rows;   
                client.query('SELECT * from ratings order by created_at desc', function (err, rate_result) {
                  ratings_value = rate_result.rows;
                  rating_details = get_rating_for_particular_product(item_id, ratings_value)
                  ratings_in_hash_format = get_rating_hash(ratings_value)
                  res.render('t_item_details.ejs',{data: item_details, ratings: ratings_in_hash_format, rating_details: rating_details, recommended_items: recommended_items, session: req.isAuthenticated(), url: req.url});
               })
            })
        }
      }
    })
  }
});

router.post('/products/add_to_cart', function(req, res){
  var items = JSON.parse(req.body.data);
  res.cookie('item_details' , items, { expires: new Date(Date.now() + 600000), httpOnly: false }).send('Cookie is set');
});

router.post('/products/delete_from_cart', function(req, res){
  var items_in_cart = []
  var items_to_delete = JSON.parse(req.body.data);
  if(req.cookies.item_details != undefined){
    items_in_cart = req.cookies.item_details;
    items_in_cart = items_in_cart.filter(function( obj ) {
      return obj.id !== items_to_delete;
    });

  }
  console.log('later')
  console.log(items_in_cart)
  res.cookie('item_details' , items_in_cart, { expires: new Date(Date.now() + 600000), httpOnly: false }).send('Cookie is set');
});

router.post('/products/update_qty', function(req, res){
  var items = JSON.parse(req.body.data);
  res.cookie('item_details' , items, { expires: new Date(Date.now() + 600000), httpOnly: false }).send('Cookie is set');
});


router.get('/mycart', function(req, res, next){
  var cart_items = [];
  console.log(cart_items);
  if(req.cookies.item_details != undefined){
    cart_items = req.cookies.item_details
  }

  if(req.isAuthenticated()){
    res.render('t_cartview.ejs', {data: cart_items, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name});
  }
  else{
    console.log(cart_items)
    res.render('t_cartview.ejs', {data: cart_items});
  }
})

router.post('/products/rate', function(req, res){
  // var items = JSON.parse(req.body.data);
  var data = req.body.data
  console.log(data)
  var rating_value = data['rate_value'];
  var comment = data['comment']
  var p_id = data['products_id']
  console.log(rating_value)
  console.log(comment)
  console.log(p_id)
  var q = client.query('INSERT into ratings(products_id, users_id, r_value, r_comment) values($1, $2, $3, $4)', [p_id, req.user.id, rating_value, comment])
  q.on('error', function(err) {
        console.log('Query error: ' + err.code);
        res.redirect(req.get('referer'));

      });
  q.on('end', function(){
    res.redirect(req.get('referer'));
  })  
});

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


var get_rating_for_particular_product = function(item, data){
  var rating_hash  = {};
  for(var i = 0, l = data.length; i < l; i++) {
    var p_id = data[i].products_id;
    if(rating_hash[p_id] != undefined){
      rating_hash[p_id].push(data[i]);
    }else{
      rating_hash[p_id] = [data[i]];
    }
  }
  return rating_hash[item]

};

var isEmpty = function(obj) { 
   for (var x in obj) { return false; }
   return true;
}

 module.exports = router
