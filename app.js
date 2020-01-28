var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();
var pg = require('pg');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cookieParser('sdasdsadsaf'));
app.use(express.urlencoded({extened:true}));

const guest_nick = 'gość';

var pool = new pg.Pool({
  host: 'localhost',
  database: 'sklep_weppo',
  user:'admin'
});

// start page
app.get('/', async (req, res) => {
	await pool.connect();
	var result = await pool.query(`select * from items`);
	await pool.release;

  	res.render('index', {
		nick: guest_nick, login: 'no', login_text:log_in,
		items: result.rows
	});
});

app.get('/register', (req, res) => {
	
});

app.get('/login', (req, res) => {

});

http.createServer(app).listen(3000);


