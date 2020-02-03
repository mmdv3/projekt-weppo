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
                    (nick, password, privileged)
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
                            name: prod.item, 
                            description: prod.description,
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
                where nick=\'${user}\';
            `);

            await client.release();

            if (res.rows.length == 1 && res.rows[0].password == pass)
                return { success: true, msg: 'Zalogowano pomyślnie!', priv: res.rows[0].privileged };
            else {
                if (res.rows.length != 1)
                    return { success: false, msg: 'Podany login nie istnieje!'};
                else
                    return { success: false, msg: 'Invalid password!'};
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
                where items.item like $1::text and available=true;`,
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

  	async getItemsMatchDesc(description) {
        try {
            var client = await this.pool.connect();
		  	var param = ['%' + description + '%'];
            var res = await client.query(`
			  	select * from items
			  	where items.description_short like $1::text and available=true;`,
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
			  	select (nick) from users;`
			);
		  	await client.release();
		  	return res.rows;
		}
	  	catch (err) {
		  	console.log(err);
		  	return [];
		}
    }
    
    async addItem(name, desc) {
        try {
            var client = await this.pool.connect();
            await client.query(`
                insert into items
                    (item, description)
                    values
                    (\'${name}\', \'${desc}\');
            `);
            return { msg: 'Towar dodano pomyślnie!' };
        }
        catch (err) {
            console.log(err);
            return { msg: 'Niepowodzenie' };
        }
    }

    async modifyItem(id, newName, newDesc) {
        try {
            var client = await this.pool.connect();
            await client.query(`
                update items 
                set item=\'${newName}\', description=\'${newDesc}\'
                where id=${id};
            `);
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
				select id from users where nick = $1::text;`,
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
		}
	  	catch (err) {
		  console.log(err);
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
