
module.exports = function(app, config) {
    var mongoose = require('mongoose'),
        db = mongoose.connect(config.db.uri),
        UrlModel = require('../url-model')(mongoose),

        error = function(msg) {
            return { error: msg };
        },

        checkUrl = function(url, fn) {
            var request = require('request');

            request(url, function(err, res, body) {
                if(err) fn(err, url);
                else fn(null, url);
                // if(res.statusCode[0]==='4' || res.statusCode[0]==='5') reject(err);
            });
        },

        urlFromId = function(req, id) {
            var encoder = require('bijective-shortener'),
                proto = req.headers['x-forwarded-proto'] || 'http',
                host = req.headers['host'],
                base = proto + '://' + host;

            return base + '/' + encoder.makeFromInteger(id);
        },

        redirectTo = function(res, url) {
            res.writeHead(302, {
                'Location': url
            });
            res.end();
        };
    app
        .get('/:id', function(req, res) {
            var decoder = require('bijective-shortener'),
                id = decoder.decodeToInteger(req.params.id);

            UrlModel.findOne({_id: id}, function(err, doc) {
                if(err) {
                    console.log(err);
                    res.json(err);
                    return;
                }
                if(doc) redirectTo(res, doc.url);
                else res.json({error: "No short url found for given input"});
            })
            // res.json(req.params);
        })

        .get(/^\/new\/(.*)/, function(req, res) {
            var url = req.params[0],
                handleError = function(fn) {
                    return function(err) {
                        if(err) {
                            res.json(err);
                            // res.sendStatus(500);
                            //console.log(err);
                        } else {
                            var args = [].slice.apply(arguments);
                            args.shift();
                            fn.apply(null, args);
                        }
                    };
                },
                shortenUrl = function(url) {
                    var doResponse = function(id) {
                        res.json({
                            original_url: url,
                            short_url: urlFromId(req, id)
                        });
                    };

                    UrlModel.findOne({url:url}, handleError(function(doc) {
                        if(doc) {
                            doResponse(doc._id);
                        } else {
                            var u = new UrlModel({ url: url });
                            u.save(handleError(function() {
                                doResponse(u._id);
                            }));
                        }
                    }));
                };

            if( req.query.allow ) {
                shortenUrl(url);
            } else {
                checkUrl(url, function(err) {
                    if(err) res.json(error('URL invalid'));
                    else shortenUrl(url);
                });
            }
        });
};
