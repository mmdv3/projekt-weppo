class Repository {

    constructor (pool) {
        this.pool = pool;
    }

    async getItems() {
        try {
            var client = await this.pool.connect();
            var res = await client.query('select * from items where available=true;');
            await client.release();
            return res.rows;
        } 
        catch (err) {
            console.log(err);
            return [];
        }
    }

    async addUser(user, pass) {
        try {
            var client = await this.pool.connect();
            var res = await client.query(`
                insert into users
                    (username, password, privileged)
                    values
                    (\'${user}\', \'${pass}\', FALSE);
            `);
            await client.release();
            return 'Zarejestrowano pomyślnie!';
        }
        catch (err) {
            console.log(err);
            return 'Podany login jest już zajęty!';
        }
    }

    async getProducts(cart) {
        try {
            var client = await this.pool.connect();
            
            cart = await Promise.all(
                cart.map(async (p) => {
                    var res = await client.query(`
                        select * from items where id=${p.id};
                    `);
                    var prod = res.rows[0];
                    if (prod) {
                        return {
                            id: prod.id,
                            name: prod.name, 
                            code: prod.code,
                            price: prod.price,
                            image: prod.image,
                            quantity: p.quantity
                        }
                    }
                    return undefined;
                })
            );

            await client.release();
            return cart.filter(p => p);
        }
        catch (err) {
            console.log(err);
            return [];
        }
    }

    async logIn(user, pass) {
        try {
            var client = await this.pool.connect();
            var res = await client.query(`
                select * from users 
                where username=\'${user}\';
            `);

            await client.release();

            if (res.rows.length == 1 && res.rows[0].password == pass)
                return { success: true, msg: 'Zalogowano pomyślnie!', priv: res.rows[0].privileged };
            else {
                if (res.rows.length != 1)
                    return { success: false, msg: 'Podany login nie istnieje!'};
                else
                    return { success: false, msg: 'Nieprawidłowe hasło!'};
            }
        }
        catch (err) {
            console.log(err);
            return { success: false, msg: 'Błąd logowania!' };
        }
    }
	 
  	async getItemsMatchName(name) {
        try {
            var client = await this.pool.connect();
            var param = ['%' + name + '%'];
            var res = await client.query(`
                select * from items
                where items.name like $1::text and available=true;`,
                param
			);
            await client.release();
            return res.rows;
        } 
	  	
        catch (err) {
            console.log(err);
            return [];
        }
    }

  	async getUsers() {
	  	try {
		  	var client = await this.pool.connect();
			var res = await client.query(`
			  	select (username) from users;`
			);
		  	await client.release();
		  	return res.rows;
		}
	  	catch (err) {
		  	console.log(err);
		  	return [];
		}
    }
    
    async addItem(name, price, code, image) {
        try {
            var client = await this.pool.connect();
            await client.query(`
                insert into items
                    (name, price, code, image)
                    values
                    (\'${name}\', ${price}, \'${code}\', \'${image}\');
            `);
            await client.release();
            return { msg: 'Towar dodano pomyślnie!' };
        }
        catch (err) {
            console.log(err);
            return { msg: 'Niepowodzenie' };
        }
    }

    async modifyItem(id, newName, newPrice, newCode, newImage) {
        try {
            var client = await this.pool.connect();
            await client.query(`
                update items 
                set name=\'${newName}\', price=${newPrice}, code=\'${newCode}\', image=\'${newImage}\'
                where id=${id};
            `);
            await client.release();
            return { msg: 'Towar został zmodyfikowany!' };
        }
        catch (err) {
            console.log(err);
            return { msg: 'Niepowodzenie!' };
        }
    }

    async removeItem(id) {
        try {
            var client = await this.pool.connect();
            await client.query(`
                update items set available=false where id=${id};
            `);
            await client.release();
            return { msg: 'Towar został usunięty!' };
        }
        catch (err) {
            console.log(err);
            return { msg: 'Niepowodzenie!' };
        }
    }

  	async getId(user_name) {
	  	try {
		  	var client = await this.pool.connect();
		  	var param = [user_name];
		  	var res = await client.query(`
				select id from users where username = $1::text;`,
			  	param
			);
		  	await client.release();
		  	return res.rows[0].id;
		}
	  	catch (err) {
		  console.log(err);
		  return -1;
		}
    } 	

  	async newOrder(user_id) {
	  	try {
		  	var client = await this.pool.connect();
		  	var res = await client.query(`
                insert into orders
                (ordering_user)
                values
                (${user_id})
                returning id;`
            );
		  	await client.release();
		  	return res.rows[0].id;
		}
	  	catch (err) {
		  console.log(err);
		  return -1;
		}
	}
		  
  	async addToOrder(order_id, record) {
	  	try {
		  	var client = await this.pool.connect();
		  	var param = [order_id, record.id, record.quantity];
		  	var res = await client.query(`
				insert into ordered_items
				(order_id, product_id, product_quantity)
				values
				($1::integer, $2::integer, $3::integer);`,
			  	param
            );
            await client.release();
		}
	  	catch (err) {
		  console.log(err);
		}
    }

    async getOrders() {
        try {
            var client = await this.pool.connect();
            var res = await client.query(`
                select users.username, orders.id from users, orders where orders.ordering_user=users.id;
            `);
            await client.release();

            var orders = await Promise.all(
                res.rows.map(async (o) => {
                    var res = await client.query(`
                        select count(id) from ordered_items where order_id=${o.id};
                    `);
                    return {
                        username: o.username,
                        orderID: o.id, 
                        itemCount: res.rows[0].count
                    };
                })
            );

            return orders;
        }
        catch (err) {
            console.log(err);
            return [];
        }
    }

    async getOrderDetails(orderID) {
        try {
            var client = await this.pool.connect();
            var res = await client.query(`
                select items.* from items, ordered_items where ordered_items.order_id=${orderID} and ordered_items.product_id=items.id;
            `);
            await client.release();
            return res.rows;
        }
        catch (err) {
            console.log(err);
            return [];
        }
    }

    end() {
        try {
            return this.pool.end();
        } 
        catch (err) {
            console.log(err);
            return {};
        }
    }
}

module.exports = Repository;
