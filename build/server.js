"use strict";

var assert = require('assert'),
    config = require('configuror')(),
    express = require('express'),
    useragent = require('express-useragent'),
    accepts = require('accepts'),
    jsonBeautifier = function (req, res, next) {
    console.log(req.query.pretty);
    if (req.query.pretty !== undefined) req.app.set('json spaces', 4);
    next();
},
    app = express().use(jsonBeautifier).get('/', function (req, res) {
    res.send('It works!');
}).get('/info/heroku', function (req, res) {
    res.json({
        params: req.params,
        query: req.query,
        headers: req.headers,
        config: config
    });
}).use(function (req, res) {
    res.sendStatus(404);
}),
    server = app.listen(config.app.port, function () {
    let port = server.address().port;
    console.log('Up an runnin');
});