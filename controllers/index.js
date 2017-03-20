var express = require('express')
  , router = express.Router()

router.use(require('./users'))
router.use(require('./products'))
router.use(require('./email_handler'))
router.use(require('./orders'))
router.use(require('./liquorzone'))

var DATABASE_URL = 'postgres://postgres:testpassword@localhost/liquorzone';
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpassword@localhost/liquorzone';

var client = new pg.Client(connectionString);
client.connect();

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
  	client.query('SELECT * from products LIMIT 10', function (err, result) {
     	if(err) { console.log('error');return next(err)}
        	items = result.rows
        	console.log("session auth" + req.isAuthenticated());
          if(req.isAuthenticated()){
      		  res.render('t_index.ejs',{data: items, session: req.isAuthenticated(), id: req.user.id, name: req.user.first_name});
          }
          else{
           res.render('t_index.ejs',{data: items, session: req.isAuthenticated()}); 
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

router.get('/admin', function(req, res) {
  if(req.user != undefined && req.user.is_admin){
    res.render('admin_template_design.ejs');
  }else{
    res.render('404.ejs');
  }
});

var isEmpty = function(obj) { 
   for (var x in obj) { return false; }
   return true;
}

module.exports = router
