const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const pg = require('pg');
const Repository = require('./repo.js');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cookieParser('23dsadsaifdsfddvcas8'));
app.use(express.urlencoded({ extended: true }));

const pool = new pg.Pool({
    host: 'localhost',
    database: 'sklep_weppo',
    user: 'admin'
});

const repo = new Repository(pool);

app.get('/', async (req, res) => {
    var items = await repo.getItems();
    res.render('index', {
        nick: 'gość',
        items: items
    });
});

http.createServer(app).listen(3000);