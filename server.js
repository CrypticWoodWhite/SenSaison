require("dotenv").config();
const express = require("express"),
	session = require("express-session"),
	path = require("path"),
	mySQLStore = require("express-mysql-session")(session),
	Passport = require("./config/passportStrategy"),
	cors = require("cors"),
	flash = require("connect-flash"),
	db = require("./models");
	
const app = express();

let PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "/public"), { extensions: ["html"] }));

app.use(cors());
// app.use((req, res, next) => {
// 	res.header("Access-Control-Allow-Origin", "*");
// 	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// 	next();
// });

app.use(flash());

// non auth routes before passport and session code
require("./routes/apiRoutes")(app);

// session and cookies
let sqlStore = new mySQLStore({
	user: process.env.MYSQLUSER,
	password: process.env.MYSQLPWD,
	database: process.env.MYSQLDB,
	host: process.env.MYSQLHOST,
	port: process.env.MYSQLPORT  
});
let sessionOptions = {
	secret: process.env.SESSION_SECRET,
	store: sqlStore,
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false,
		maxAge: 24*60*60*1000
	}
};
if (process.env.NODE_ENV === "production") {
	sqlStore = new mySQLStore({
		user: process.env.JAWSDB_USER,
		password: process.env.JAWSDB_PWD,
		database: process.env.JAWSDB_DB,
		host: process.env.JAWSDB_HOST,
		port: process.env.JAWSDB_PORT
	});
	app.set("trust proxy", 1);
	sessionOptions.cookie.secure = true; // serve secure cookies only in production

}
app.use(session(sessionOptions));
app.use(Passport.initialize());
app.use(Passport.session());

// auth routes
require("./routes/authRoutes")(app);

let syncOptions = { force: false };
if (process.env.NODE_ENV === "test") {
	syncOptions.force = true;
}

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