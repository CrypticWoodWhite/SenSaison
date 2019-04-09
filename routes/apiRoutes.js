const db = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const json2csv = require("json2csv").parse;

module.exports = function (app) {

    // FIND ALL observations
    app.get("/api/observations", function (req, res) {
        db.Observations.findAll({
            include: [{
                model: db.Users,
                attributes: ["userId", "firstName", "lastName", "username"]
            }]
        }).then(function (dbObs) {
            res.json(dbObs);
        });
    });


    // FIND ALL observations grouped by category
    app.get("/api/categories/:category", function (req, res) {
        db.Observations.findAll({
            where: {
                category: req.params.category
            },
            include: [{
                model: db.Users,
                attributes: ["userId", "firstName", "lastName", "username"]
            }]
        }).then(function (dbObs) {
            res.json(dbObs);
        });
    });

    // GET most recent ONE observation of each category by TIMESTAMP
    app.get("/api/:category/mostrecentone", function (req, res) {
        db.Observations.findAll({
            limit: 1,
            where: {
                category: req.params.category,

            },
            order: [["createdAt", "DESC"]],
            include: [{
                model: db.Users,
                attributes: ["username"]
            }]
        }).then(function (recentObs) {
            res.json(recentObs);
        });
    });

    // GET most recent FIVE observations of each category by TIMESTAMP
    app.get("/api/:category/mostrecentfive", function (req, res) {
        db.Observations.findAll({
            limit: 5,
            where: {
                category: req.params.category,

            },
            order: [["createdAt", "DESC"]],
            include: [{
                model: db.Users,
                attributes: ["username"]
            }]
        }).then(function (recentObs) {
            res.json(recentObs);
        });
    });

    // CREATE new observation
    // need to test this with oauth
    app.post("/api/observations", function (req, res) {
        db.Observations.create(req.body)
            .then(function (dbObs) {
                res.json(dbObs);
            });
    });

    // DESTROY one observation
    app.delete("/api/observations/:id", function (req, res) {
        db.Observations.destroy({
            where: {
                id: req.params.id
            }
        }).then(function (dbObs) {
            res.json(dbObs);
        });
    });

    // FIND observations for data request, convert to csv, and download client side
    app.get("/download", function (req, res) {
        // moved these two lines up here since setting headers needs to be done as early on as possible in the operation
        res.setHeader("Content-disposition", "attachment; filename=sensaisondownload.csv");
        res.setHeader("Content-Type", "text/csv");

        db.Observations.findAll({
            where: {
                category: req.query.category,
                dateObs: {
                    [Op.between]: [req.query.minDate, req.query.maxDate]
                }
            }
        }).then(function (result) {
            let csv = json2csv(result, {
                fields: ["id", "userId", "pictureId", "dateObs", "timeObs", "latitude", "longitude", "category", "species", "speciesSciName", "speciesConfidence", "firstConfidence", "briefDescription", "extendedDescription"]
            });
            console.log(csv);
            // below line does not work
            res.status(200).send("HELLO THERE");
        }).done(function() {
            console.log("successful download");
        })
    });

    // FIND ALL users
    app.get("/api/users", function (req, res) {
        db.Users.findAll({
            attributes: ["userId", "firstName", "lastName", "username"],
            include: [db.Observations]
        }).then(function (allusr) {
            res.json(allusr);
        });
    });

    // CREATE new user
    // need to test this with oauth
    app.post("/api/users", function (req, res) {
        db.Users.create(req.body)
            .then(function (newusr) {
                res.json(newusr);
            });
    });

};
