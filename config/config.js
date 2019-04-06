require("dotenv").config();
require("./keys");

module.exports = {
    "development": {
        "username": "root" || process.env.MYSQLUSER,
        "password": "Youreprettygood1!" || process.env.MYSQLPWD,
        "database": "senseason_db" || process.env.MYSQLDB,
        "host": "127.0.0.1" || process.env.MYSQLHOST,
        "dialect": "mysql"  
    },
    "test": {
        "username": "root",
        "password": "Youreprettygood1!",
        "database": "senseason_db",
        "host": "127.0.0.1",
        "dialect": "mysql"
    },
    production: {
    // eslint-disable-next-line camelcase
        "use_env_variable": process.env.JAWSDB_URL,
        "dialect": "mysql"
    }
};
