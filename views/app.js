/// modules ///////////////////////////////////////////////////////////////////
var http = require('http');
var express = require('express');
///////////////////////////////////////////////////////////////////////////////
var app = express();
var pg = require('pg'); //postgreSQL

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({extened:true}));
///////////////////////////////////////////////////////////////////////////////
const log_in = 'zaloguj się';
const log_out = 'wyloguj się';
const guest_nick = 'gość';

var pool = new pg.Pool({
  host: 'localhost',
  database: 'weppo_projekt',
  user:'archie'
});
/// get/post //////////////////////////////////////////////////////////////////
  // start page
  app.get( '/', async (req, res) => {

	var item_pool = [];
	var item_name = [];
	var item_desc = [];

	await pool.connect();
	var result = await pool.query(`select * from items`);

	result.rows.forEach( r => {
	  item_pool.push([`${r.item}`,`${r.description}`]);
	});

  await pool.release;

	console.log(item_name);

  res.render('index', {nick:guest_nick, login:'no', login_text:log_in,
  	//item_name:item_name, item_desc:item_desc}); 

	item_pool:item_pool});
});

/// server ////////////////////////////////////////////////////////////////////
http.createServer(app).listen(3000);


