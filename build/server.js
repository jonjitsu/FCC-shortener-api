"use strict";

var assert = require('assert'),
    fs = require('fs'),
    config = require('configuror')(),
    express = require('express'),
    mongoose = require('mongoose'),
    db = mongoose.connect(config.db.uri),
    UrlModel = require('./url-model')(mongoose),
    checkUrl = function (url, fn) {
    var request = require('request');

    request(url, function (err, res, body) {
        if (err) fn(err, url);else fn(null, url);
        // if(res.statusCode[0]==='4' || res.statusCode[0]==='5') reject(err);
    });
},
    urlFromId = function (req, id) {
    var encoder = require('bijective-shortener'),
        proto = req.headers['x-forwarded-proto'] || 'http',
        host = req.headers['host'],
        base = proto + '://' + host;

    return base + '/' + encoder.makeFromInteger(id);
},
    redirectTo = function (res, url) {
    res.writeHead(302, {
        'Location': url
    });
    res.end();
},
    app = express().use(require('./json-beautifier')).use(require('./easy-renderer')).get('/', function (req, res) {
    res.render('index');
}).get('/:id', function (req, res) {
    var decoder = require('bijective-shortener'),
        id = decoder.decodeToInteger(req.params.id);

    UrlModel.findOne({ _id: id }, function (err, doc) {
        if (err) {
            console.log(err);
            res.json(err);
            db.connection.close();
            return;
        }
        if (doc) redirectTo(res, doc.url);else res.json({ error: "No short url found for given input" });
    });
    // res.json(req.params);
}).get(/^\/new\/(.*)/, function (req, res) {
    var url = req.params[0],
        handleError = function (fn) {
        return function (err) {
            if (err) {
                res.json(err);
                // res.sendStatus(500);
                console.log(err);
                db.connection.close();
            } else {
                var args = [].slice.apply(arguments);
                args.shift();
                fn.apply(null, args);
            }
        };
    },
        shortenUrl = function (url) {
        var doResponse = function (id) {
            res.json({
                original_url: url,
                short_url: urlFromId(req, id)
            });
            db.connection.close();
        };

        UrlModel.findOne({ url: url }, handleError(function (doc) {
            if (doc) {
                doResponse(doc._id);
            } else {
                var u = new UrlModel({ url: url });
                u.save(handleError(function () {
                    doResponse(u._id);
                }));
            }
        }));
    };

    if (req.query.allow) {
        shortenUrl(url);
    } else {
        checkUrl(url, handleError(function () {
            shortenUrl(url);
        }));
    }
}).get('/info/heroku', function (req, res) {
    res.json({
        params: req.params,
        query: req.query,
        headers: req.headers,
        env: process.env
        // data:data
        // config: config
    });
}).use(function (req, res) {
    res.sendStatus(404);
}),
    server = app.listen(config.app.port, function () {
    let port = server.address().port;
    console.log('Up an runnin');
});