const Passport = require("../config/passportStrategy"),
	ensureAuthenticated = require("./ensureAuthenticated"),
	db = require("../models"),
	path = require("path");

let person,
	access_token;

module.exports = app => {

	app.post("/auth/openid-client", Passport.authenticate("openid-client"));
	// above not working

	app.get("/auth/openid-client/callback",
		Passport.authenticate("openid-client", {
			session: true,
			failureRedirect: "/" ,
			failureFlash: "Problem with authentication, try again",
		}),	(req, res) => {
			// res.setHeader("Cookie", ["set-cookie"]);
			console.log("REQ.USER: ", req.user);

			window.person = req.user; // app-level variable?????????????????
			window.access_token = req.access_token;

			req.session.save(() => {
				res.send({ person, access_token });
				res.redirect("/useraccount");
				console.log("SUCCESSFUL AUTHENTICATION");
				// return (person, access_token);
			});
		}
	);
	
	// protect user account page
	app.get("/useraccount", ensureAuthenticated, (req, res) => {
		console.log("user account page");
		console.log(req.user);
		console.log(person);

		// res.sendFile(path.join(__dirname, "../views/useraccount.html"));

		res.render("useraccount", { user: person }, (err, html) => {
			if (err) {
				console.log(err);
				return;
			}
			res.send(html);
		});
	});

	app.get("/logout", (req, res) => {
		console.log("LOGGING OUT");
		req.logout;
		req.session.destroy(() => res.redirect("/"));
	});

	app.get("/", (req, res) => {
		res.render("index", (err, html) => {
			res.send(html);
		});
	});

};