"use strict";

var assert = require('assert'),
    fs = require('fs'),
    config = require('configuror')(),
    express = require('express'),
    mongoose = require('mongoose'),

// withDb = function(fn) {
//     var MongoClient = require('mongodb').MongoClient;

//     MongoClient.connect(config.db.uri, function(err, db) {
//         assert.equal(null, err);
//         console.log('Connected to Mongo server');

//         fn(db);
//     });
// },

// middlewares
render = function (tmp) {
    return fs.readFileSync('view/' + tmp + '.html').toString();
},
    easyRenderer = function (req, res, next) {
    res.render = function (tpl) {
        res.send(render(tpl));
    };
    next();
},
    jsonBeautifier = function (req, res, next) {
    console.log(req.query.pretty);
    if (req.query.pretty !== undefined) req.app.set('json spaces', 4);
    next();
},
    checkUrl = function (url, fn) {
    var request = require('request');

    request(url, function (err, res, body) {
        if (err) fn(err, url);else fn(null, url);
        // if(res.statusCode[0]==='4' || res.statusCode[0]==='5') reject(err);
    });
},
    urlFromId = function (base, id) {
    console.log(id, typeof id);
    var encoder = require('bijective-shortener');
    return base + '/' + encoder.makeFromInteger(id);
},
    app = express().use(jsonBeautifier).use(easyRenderer).get('/', function (req, res) {
    res.render('index');
})
//{ original_url:'', short_url:''}
.get(/^\/new\/(.*)/, function (req, res) {
    var url = req.params[0],
        db = mongoose.connect(config.db.uri),
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
        var UrlModel = require('./url-model')(mongoose),
            doResponse = function (id) {
            res.json({
                original_url: url,
                short_url: urlFromId(id)
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