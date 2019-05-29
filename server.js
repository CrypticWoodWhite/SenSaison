require("dotenv").config();
const express = require("express");
const session = require('express-session');
const mySQLStore = require("express-mysql-session")(session);
const Passport = require("./config/passportStrategy");
const cors = require("cors");
const flash = require('connect-flash');
const db = require("./models");
const app = express();

let PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(cors());
app.use(flash());

let sqlStore;
if (process.env.NODE_ENV === "production") {
    sqlStore = new mySQLStore({
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPWD,
        database: process.env.MYSQLDB,
        host: process.env.MYSQLHOST,
        port: process.env.MYSQLPORT  
    })
} else {
    sqlStore = new mySQLStore({
        user: process.env.JAWSDB_USER,
        password: process.env.JAWSDB_PWD,
        database: process.env.JAWSDB_DB,
        host: process.env.JAWSDB_HOST,
        port: process.env.JAWSDB_PORT
    })
};

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sqlStore,
    resave: false,
    saveUninitialized: true,
    cookie: {},
 }));
app.use(Passport.initialize());
app.use(Passport.session());

// Routes
require("./routes/apiRoutes")(app);

let syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
    syncOptions.force = true;
};

// Starting the server, syncing our models
db.sequelize.sync(syncOptions).then(() => {
    app.listen(PORT, () => {
        console.log(
            "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
            PORT,
            PORT
        );
    });
});

module.exports = app;
