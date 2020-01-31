const http = require('http');
const express = require('express');
const session = require('express-session');
const pg = require('pg');
const Repository = require('./repo.js');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(session({
    secret: 'sdadsaxzzxcv',
    resave: true,
    saveUninitialized: true
}));

app.use(express.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    if (!req.session.username) {
        req.session.username = 'gość';
    }
    next();
});

function isLogged(req, res, next) {
    if (req.session.logged) {
        next();
    }
    else {
        res.redirect('/login');
    }
}

function isPrivileged(req, res, next) {
    if (req.session.privileged) {
        next();
    }
    else {
        res.redirect('/login');
    }
}

class Product {
    constructor (id, quantity) {
        this.id = id;
        this.quantity = quantity;
    }
}

const repo = new Repository(new pg.Pool({
    host: 'localhost', 
    database: 'sklep_weppo',
    user: 'admin'
}));

app.get('/', async (req, res) => {
    var items = await repo.getItems();
    var prodAmount = req.session.logged ? req.session.cart.length : 0;

    res.render('index', {
        username: req.session.username,
        items: items, 
        logged: req.session.logged,
	  	privileged: req.session.privileged,
        prodAmount: prodAmount
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        msg: ''
    });
});

app.post('/register', async (req, res) => {
    var user = req.body.username;
    var pass = req.body.password;

    if (user.length <= 4) {
        var msg = 'Zbyt krótki login!'
    }
    else if (pass.length <= 5) {
        var msg = 'Zbyt krótkie hasło!'
    }
    else {
        var msg = await repo.addUser(user, pass);
    }
    
    res.render('login', {
        msg: msg,
    });
});

app.post('/login', async (req, res) => {
    var user = req.body.username;
    var pass = req.body.password;
    var info = await repo.logIn(user, pass);
  	var priv = await repo.isPrivileged(user);

    if (info.success) {
        req.session.logged = true;
        req.session.username = user;
	  	req.session.privileged = priv;
        req.session.cart = [];

        var items = await repo.getItems();
	  	        
        res.render('index', {
            username: req.session.username, 
            items: items, 
            logged: req.session.logged, 
		  	privileged: req.session.privileged,
            prodAmount: req.session.cart.length
        });
    }
    else {
        res.render('login', {
            msg: info.msg
        });
    }
});

app.post('/logout', isLogged, async (req, res) => {
    req.session.username = 'gość';
    delete req.session.logged;
    delete req.session.cart;
    delete req.session.privileged;

    var items = await repo.getItems();

    res.render('index', {
        username: req.session.username, 
        items: items, 
        logged: req.session.logged,
	  	privileged: req.session.privileged
    });
});

app.post('/query', async (req, res) => {
  	if (req.body.query_type == 'name') {
	  var items = await repo.getItemsMatchName(req.body.query_key);
	} else if (req.body.query_type == 'desc') {
	  var items = await repo.getItemsMatchDesc(req.body.query_key);
	} else {
	  var items = await repo.getItems();
	}

    var prodAmount = req.session.logged ? req.session.cart.length : 0;

    res.render('index', {
        username: req.session.username, 
        items: items, 
        logged: req.session.logged,
	  	privileged: req.session.privileged,
        prodAmount: prodAmount
    });
});

app.post('/add_to_cart', isLogged, async (req, res) => {
    var productID = req.body.productID;
    var quantity = Number(req.body.quantity);
    if (quantity < 0)
        quantity = 0;

    var prod = req.session.cart.find(p => p.id == productID);
    if (prod) {
        prod.quantity = Number(prod.quantity) + quantity;
    }
    else if (quantity > 0) {
        req.session.cart.push(
            new Product(productID, quantity)
        );
    }

    var items = await repo.getItems();

    res.render('index', {
        username: req.session.username, 
        items: items, 
        logged: req.session.logged,
	  	privileged: req.session.privileged,
        prodAmount: req.session.cart.length
    });
});

app.post('/remove_from_cart', isLogged, async (req, res) => {
    req.session.cart = req.session.cart.filter(p => p.id != req.body.productID);
    res.redirect('/cart');
});

app.get('/cart', isLogged, async (req, res) => {  
    var cart = await repo.getProducts(req.session.cart); 
    res.render('cart', {
        cart: cart
    });
});

app.get('/users', isPrivileged, async (req, res) => {
  	var users = await repo.getUsers();
  	res.render('users', {
	  	users: users
	});
});

http.createServer(app).listen(3000);
