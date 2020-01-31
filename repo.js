class Repository {

    constructor (pool) {
        this.pool = pool;
    }

    async getItems() {
        try {
            var client = await this.pool.connect();
            var res = await client.query('select * from items;');
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
                select (password) from users 
                where nick=\'${user}\';
            `);
            await client.release();
            
            if (res.rows.length == 1 && res.rows[0].password == pass) {
                return { success: true, msg: 'Zalogowano pomyślnie!'};
            }
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

  	// % - pattern matching arbitrary string
  	async getItemsMatchName(name) {
        try {
            var client = await this.pool.connect();
		  	var param = [];
		  	param[0] = '%' + name + '%';
            var res = await client.query(`
			  select * from items
			  where items.item like $1::text;`,
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
		  	var param = [];
		  	param[0] = '%' + description + '%';
            var res = await client.query(`
			  select * from items
			  where items.description like $1::text;`,
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
