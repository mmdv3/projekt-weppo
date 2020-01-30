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

app.use((req, res, next) => {
    if (!req.signedCookies.username) {
        res.cookie('username', 'gość', { signed: true });
        res.redirect(req.url);
    }
    else {
        next();
    }
});

const pool = new pg.Pool({
    host: 'localhost',
    database: 'sklep_weppo',
    user: 'admin'
});

const repo = new Repository(pool);

app.get('/', async (req, res) => {
    var items = await repo.getItems();
    res.render('index', {
        nick: req.signedCookies.username,
        items: items,
        msg: '',
        logged: req.signedCookies.logged
    });
});

app.post('/register', async (req, res) => {
    var user = req.body.username;
    var pass = req.body.password;

    var msg = '';
    
    if (user.length <= 4) {
        msg = 'Zbyt krótki login!';
    }
    else if (pass.length <= 5) {
        msg = 'Zbyt krótkie hasło!;'
    }
    else {
        msg = await repo.addUser(user, pass);
    }

    var items = await repo.getItems();

    res.render('index', {
        nick: req.signedCookies.username,
        items: items,
        msg: msg,
        logged: req.signedCookies.logged
    });
});

app.post('/login', async (req, res) => {
    var user = req.body.username;
    var pass = req.body.password;

    var info = await repo.logIn(user, pass);

    if (info.success) {
        res.cookie('logged', true, { signed: true });
        res.cookie('username', user, { signed: true });
    }

    var items = await repo.getItems();

    res.render('index', {
        nick: info.success ? user : req.signedCookies.username, 
        items: items,
        msg: info.msg,
        logged: info.success
    });
});

app.post('/logout', async (req, res) => {
    res.cookie('logged', false, { signed: true, maxAge: -1 });
    res.cookie('username', 'gość', { signed: true });

    var items = await repo.getItems();

    res.render('index', {
        nick: 'gość',
        items: items,
        msg: 'Wylogowano pomyślnie!',
        logged: false
    });
});


http.createServer(app).listen(3000);