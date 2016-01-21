"use strict";

var assert = require('assert'),
    config = require('configuror')(),
    express = require('express'),
    useragent = require('express-useragent'),
    accepts = require('accepts'),
    withDb = function (fn) {
    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(config.db.uri, function (err, db) {
        assert.equal(null, err);
        console.log('Connected to Mongo server');

        fn(db);
    });
},
    jsonBeautifier = function (req, res, next) {
    console.log(req.query.pretty);
    if (req.query.pretty !== undefined) req.app.set('json spaces', 4);
    next();
},
    app = express().use(jsonBeautifier).get('/', function (req, res) {
    res.send('It works!');
}).get('/info/heroku', function (req, res) {
    withDb(function (db) {
        db.collection('urls').find().toArray(function (err, data) {
            if (err) return;
            res.json({
                params: req.params,
                query: req.query,
                headers: req.headers,
                data: data
                // config: config
            });
            db.close();
        });
    });
}).use(function (req, res) {
    res.sendStatus(404);
}),
    server = app.listen(config.app.port, function () {
    let port = server.address().port;
    console.log('Up an runnin');
});