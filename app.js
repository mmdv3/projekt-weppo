const http = require('http');
const express = require('express');
const session = require('express-session');
const pg = require('pg');
const Repository = require('./repo.js');
const fs = require('fs');


const app = express();
app.use(express.static( "public" ));
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
        req.session.username = 'Gość';
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

// done
app.get('/', async (req, res) => {
    var items = await repo.getItems();
    var prodAmount = req.session.logged ? req.session.cart.length : 0;

    res.render('index', {
        username: req.session.username,
        items: items, 
        logged: req.session.logged,
	  	privileged: req.session.privileged,
        prodAmount: prodAmount,
    });
});

// done
app.get('/login', (req, res) => {
    res.render('login', {
        username: req.session.username,
        logged: req.session.logged, 
        privileged: req.session.privileged,
        msg: ''
    });
});

// done
app.post('/register', async (req, res) => {
    var user = req.body.username.trim();
    var pass = req.body.password;

    if (user.length <= 4)
        var msg = 'Zbyt krótki login!';
    else if (pass.length <= 5)
        var msg = 'Zbyt krótkie hasło!';
    else
        var msg = await repo.addUser(user, pass);
    
    res.render('login', {
        username: req.session.username,
        msg: msg,
        privileged: req.session.privileged
    });
});

// done
app.post('/login', async (req, res) => {
    var user = req.body.username.trim();
    var pass = req.body.password;
    var info = await repo.logIn(user, pass);
      
    if (info.success) {
        req.session.logged = true;
        req.session.username = user;
	  	req.session.privileged = info.priv;
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
            username: req.session.username,
            msg: info.msg,
            privileged: req.session.privileged
        });
    }
});

// done
app.get('/logout', isLogged, async (req, res) => {
    req.session.username = 'Gość';

    delete req.session.logged;
    delete req.session.cart;
    delete req.session.privileged;

    var items = await repo.getItems();

    res.render('index', {
        username: req.session.username, 
        items: items, 
        logged: req.session.logged,
        privileged: req.session.privileged,
    });
});

// done
app.post('/query', async (req, res) => {
    var items = await repo.getItemsMatchName(req.body.search);
    var prodAmount = req.session.logged ? req.session.cart.length : 0;

    res.render('index', {
        username: req.session.username, 
        items: items, 
        logged: req.session.logged,
	  	privileged: req.session.privileged,
        prodAmount: prodAmount
    });
});

// done
app.post('/add_to_cart', isLogged, async (req, res) => {
    var productID = req.body.productID;
    var quantity = Number(req.body.quantity);
    if (quantity < 0)
        quantity = 0;

    var prod = req.session.cart.find(p => p.id == productID);
    if (prod)
        prod.quantity = Number(prod.quantity) + quantity;
    else if (quantity > 0)
        req.session.cart.push(
            new Product(productID, quantity)
        );

    var items = await repo.getItems();

    res.render('index', {
        username: req.session.username, 
        items: items, 
        logged: req.session.logged,
	  	privileged: req.session.privileged,
        prodAmount: req.session.cart.length
    });
});

// done
app.post('/remove_from_cart', isLogged, async (req, res) => {
    req.session.cart = req.session.cart.filter(p => p.id != req.body.productID);
    res.redirect('/cart');
});

// done
app.get('/cart', isLogged, async (req, res) => {  
    var cart = await repo.getProducts(req.session.cart); 
    var totalPrice = cart.reduce((total, prod) => {
        return total + prod.price;
    }, 0);

    res.render('cart', {
        cart: cart,
	  	username: req.session.username,
	  	prodAmount: req.session.cart.length,
        privileged: req.session.privileged,
        totalPrice: totalPrice
    });
});

// done
app.get('/users', isPrivileged, async (req, res) => {
    var users = await repo.getUsers();
  	res.render('users', {
	  	users: users,
        username: req.session.username,
        privileged: req.session.privileged
	});
});

// done
app.post('/make_order', isLogged, async (req, res) => {
    var user = await repo.getId(req.session.username);
    var order_id = await repo.newOrder(user);
    await req.session.cart.forEach(async (record) => {
      await repo.addToOrder(order_id, record);
    });
    req.session.cart = [];
    res.redirect('finished_order');
});

// done
app.get('/finished_order', isLogged, async (req, res) => {
    res.render('finished_order', {
        username: req.session.username,
        privileged: req.session.privileged
	});
});

// done
app.get('/products', isPrivileged, (req, res) => {
    res.render('products', {
      username: req.session.username,
      privileged: req.session.privileged
    });
});

app.post('/edit_products', isPrivileged, async (req, res) => {
    var items = await repo.getItems();
    res.render('edit', {
        items: items,
        username: req.session.username,
        privileged: req.session.privileged,
        msg: ''
    });
});

app.post('/modify', isPrivileged, async (req, res) => {
    var newName = req.body.name;    
    var newPrice = req.body.price;
    var newCode = req.body.code;
    var newImage = req.body.image;
    var id = req.body.id;

    var info = await repo.modifyItem(id, newName, newPrice, newCode, newImage);
    var items = await repo.getItems();

    res.render('edit', {
        items: items,
        username: req.session.username,
        privileged: req.session.privileged,
        msg: info.msg
    });
});

app.post('/remove', isPrivileged, async (req, res) => {
    var id = req.body.id;
    var info = await repo.removeItem(id);
    var items = await repo.getItems();

    res.render('edit', {
        items: items,
        msg: info.msg,
        privileged: req.session.privileged,
        username: req.session.username
    })
});

app.post('/add_products', isPrivileged, (req, res) => {
    res.render('add', {
        msg: '',
        username: req.session.username,
        privileged: req.session.privileged
    });
});

app.post('/add', isPrivileged, async (req, res) => {
    var name = req.body.name;
    var price = req.body.price;
    var code = req.body.code;
    var image = req.body.image;
    var info = await repo.addItem(name, price, code, image);

    res.render('add', {
        msg: info.msg,
        username: req.session.username,
        privileged: req.session.privileged
    });
});

// done
app.get('/orders', isPrivileged, async (req, res) => {
    var orders = await repo.getOrders();
    
    res.render('orders', {
        username: req.session.username,
        orders: orders,
        privileged: req.session.privileged
    });
});

// done
app.post('/order_details', isPrivileged, async (req, res) => {
    var orderID = req.body.orderID;
    var details = await repo.getOrderDetails(orderID);

    res.render('order_details', {
        username: req.session.username, 
        details: details,
        orderID: orderID,
        privileged: req.session.privileged
    });
});

// done
app.get('/contact', (req, res) => {
    res.render('contact', {
        username: req.session.username,
        privileged: req.session.privileged
    });
});

// done
app.get('*', (req, res) => {
    res.render('404', {
        username: req.session.username,
        privileged: req.session.privileged
    });
})

http.createServer(app).listen(3000);
