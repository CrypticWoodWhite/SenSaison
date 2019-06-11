const Passport = require("../config/passportStrategy");
const ensureAuthenticated = require("./ensureAuthenticated");

let person;
let access_token;

module.exports = (app) => {

	app.post("/auth/openid-client", Passport.authenticate("openid-client"));

	app.get("/auth/openid-client/callback",
		Passport.authenticate("openid-client", {
			session: true,
			failureRedirect: "/" ,
			failureFlash: "Problem with authentication, try again",
		}),	(req, res) => {
			// res.setHeader("Cookie", ["set-cookie"]);
			console.log("REQ.USER: ", req.user);
			window.person = req.user; // app-level variable
			window.access_token = req.access_token;
			req.session.save(() => {
				res.send({ person, access_token });
				res.redirect("/useraccount")
				console.log("SUCCESSFUL AUTHENTICATION");
				// return (person, access_token);
			});
		}
	);
	
	// protect user account page
	app.get("/useraccount", ensureAuthenticated, (req, res) => {
		console.log(req.user);
		console.log(person);
		app.render("/useraccount", { user: person }, (err, html) => {
			if (err) {
				logger.warn(err);
				return;
			}
			res.send(html);
		});
	}
	);

	app.get("/logout", (req, res) => {
		console.log("LOGGING OUT");
		req.logout;
		req.session.destroy(() => res.redirect("/"));
	});

};