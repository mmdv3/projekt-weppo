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