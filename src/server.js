"use strict";


var assert = require('assert'),
    config = require('configuror')(),
    express = require('express'),
    useragent = require('express-useragent'),
    accepts = require('accepts'),
    fs = require('fs'),

    withDb = function(fn) {
        var MongoClient = require('mongodb').MongoClient;


        MongoClient.connect(config.db.uri, function(err, db) {
            assert.equal(null, err);
            console.log('Connected to Mongo server');

            fn(db);
        });
    },


    // middlewares
    render = function(tmp) {
        return fs.readFileSync('view/' + tmp + '.html').toString();
    },
    easyRenderer = function(req, res, next) {
        res.render = function(tpl) {
            res.send(render(tpl));
        };
        next();
    },
    jsonBeautifier = function(req, res, next) {
        console.log(req.query.pretty);
        if(req.query.pretty!==undefined) req.app.set('json spaces', 4);
        next();
    },

    checkUrl = function(url) {
        var request = require('request');

        return new Promise(function(resolve, reject) {
            request(url, function(err, res, body) {
                if(err) reject(err);
                // if(res.statusCode[0]==='4' || res.statusCode[0]==='5') reject(err);
                resolve(url);
            });
        });
    },

    app = express()
    .use(jsonBeautifier)
    .use(easyRenderer)
     .get('/', function(req, res) {
         res.render('index');
     })
//{ original_url:'', short_url:''}
    .get(/^\/new\/(.*)/, function(req, res) {
        var url = req.params[0];

        if( req.query.allow ) {
            res.json({good:true})
        } else {
            checkUrl(url)
                .then(function good(url) {
                    res.json({url:url});
                }, function bad(err) {
                    res.json({error:err})
                });
        }
        // res.json(req.params);
        // checkUrl(req.params)
    })

    .get('/info/heroku', function(req, res) {
        withDb(function(db) {
            db.collection('urls').find().toArray(function(err, data) {
                if(err) return;
                res.json({
                    params: req.params,
                    query: req.query,
                    headers: req.headers,
                    data:data
                    // config: config
                });
                db.close();
            });
        });
    })
     .use(function(req, res) {
         res.sendStatus(404);
     }),
     server = app.listen(config.app.port, function() {
         let port = server.address().port;
         console.log('Up an runnin');
     });
