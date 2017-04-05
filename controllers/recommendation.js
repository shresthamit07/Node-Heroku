var express = require('express')
  , router = express.Router()
  , validator = require('express-validator');
var session = require('express-session');
var app = module.exports = express();
var moment = require('moment');

var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

var client = new pg.Client(connectionString);
client.connect();

app.get('/rec', function(req, res){
    // res.clearCookie("item_details");
    get_recommendation()
	res.redirect('/admin')
});

var get_recommendation = function(){
	client.query('SELECT products_id, users_id, r_value from ratings', function (err, result) {
    	if(err) { console.log('error');return next(err)}
    	var items = result.rows
    	//items is not found
    	if(items.length != 0){
    		var prefs = prepare_product_rating_hash(items)
    		var unique_users = Object.keys(prefs);

    		for(var i=0; i< unique_users.length; i++){
    			find_weighted_score(prefs, unique_users[i])
    		}
    		
    	}else{
    		console.log('No items found in ratings table.');
    		// return done(null, false, { message: 'No items found.' });
    	}
    })
}

var find_uniq_users = function(input_hash){
	var flags = [], unique_users = [], l = input_hash.length, i;
	for( i=0; i<l; i++) {
	    if( flags[input_hash[i].users_id]) continue;
	    flags[input_hash[i].users_id] = true;
	    unique_users.push(input_hash[i].users_id);
	}

	return unique_users;
}


// {'u1': {'i1': 2, 'i2': 3}, 'u1': {'i1': 2, 'i2': 3}}
var prepare_product_rating_hash = function(items){
	var user_hash = {}
	var item_hash = {}
	for (var i = 0; i < items.length; i++) {
		var p_id = items[i].products_id;
		var r_value = items[i].r_value;
		var temp_hash = {}
		temp_hash[p_id] = r_value

		if(user_hash[items[i].users_id] != undefined){		
			user_hash[items[i].users_id] = extend(user_hash[items[i].users_id], user_hash[items[i].users_id], temp_hash)
		}else{
			user_hash[items[i].users_id] = temp_hash
		}
  }

  return user_hash
}

var find_weighted_score = function(prefs, person){
	var totals = {};
	var simSums = {};
	var recomm_hash = {};
	var keys = Object.keys(prefs);
	for(i in keys){
		var other = keys[i]

		//don't compare to self
		if(other != person){
			sim = calculate_pearson_score(prefs, person, other)
			//ignore scores of zero or lower
			if(sim > 0){

				for(var item in prefs[keys[i]]) {
 					//only score item that I haven't bought yet
					if(!(item in prefs[person])){
						if(totals[item] != undefined){
							totals[item] += prefs[other][item] * sim;
							simSums[item] += sim;
						}else{
							totals[item] = prefs[other][item] * sim;
							simSums[item] = sim;
						}
					}
				}

				
				var ranking = totals[item]/simSums[item]
			} 
		}
	}
	for(var product in totals) {
		if(totals[product] != undefined){
			recomm_hash[product] = totals[product]/simSums[product]
		}
	}

	if(Object.keys(recomm_hash).length > 0){
		save_ranking_to_db(person, recomm_hash)
	}
}

var save_ranking_to_db = function(person, recomm_hash){
	for(item in recomm_hash){
		var query = client.query('INSERT INTO recommendations(users_id, products_id, weighted_score) values($1, $2, $3)',
	    [person, item, recomm_hash[item]]);	
	    query.on('error', function(err) {
  			console.log('Query error: ' + err.code);
		});
		query.on('end', function(){
			console.log('Query success')
		})  
	}
}

var calculate_pearson_score = function(prefs, u1, u2){

	//exclude products that has already been rated by the given user
	// var items = find_recommendable_products()

	//for each item in items calculate pearson correlation with each user in similar_users
  var si = [];

  for (var key in prefs[u1]) {
    if (prefs[u2][key]) si.push(key);
  }

  var n = si.length;

  if (n == 0) return 0;

  //add up all preferences
  var sum1 = 0;
  for (var i = 0; i < si.length; i++) sum1 += prefs[u1][si[i]];

  var sum2 = 0;
  for (var i = 0; i < si.length; i++) sum2 += prefs[u2][si[i]];

  //sum up the squares
  var sum1Sq = 0;
  for (var i = 0; i < si.length; i++) {
    sum1Sq += Math.pow(prefs[u1][si[i]], 2);
  }

  var sum2Sq = 0;
  for (var i = 0; i < si.length; i++) {
    sum2Sq += Math.pow(prefs[u2][si[i]], 2);
  }

  //sum up the products
  var pSum = 0;
  for (var i = 0; i < si.length; i++) {
    pSum += prefs[u1][si[i]] * prefs[u2][si[i]];
  }

  var num = pSum - (sum1 * sum2 / n);
  var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
      (sum2Sq - Math.pow(sum2, 2) / n));

  if (den == 0) return 0;

  return num / den;

}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

// select distinct(users_id) from ratings;

// recommendation for user id =8
// select products_id from ratings where users_id=8;
// select users_id from ratings where products_id in (53,54,58,60);
// select distinct(users_id) from ratings where products_id in (53,54,58,60);
// select products_id from ratings where users_id = 9 and products_id in (select products_id from ratings where users_id = 8);
