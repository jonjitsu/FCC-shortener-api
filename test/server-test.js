var assert = require('chai').assert,
    is = assert.strictEqual,
    de = assert.deepEqual,
    superagent = require('superagent'),

    config = require('configuror')({env: 'test'}),
    app = require('../src/app')(config),
    mongodb = require('mongodb')
;

describe('app', function() {
    var server,
        port = 3017,
        testAddress = 'http://localhost:' + port.toString(),
        address = function(path) {
            return testAddress + path;
        };

    beforeEach(function() {
        server = app.listen(port)
    });
    afterEach(function() {
        server.close();
        mongodb.MongoClient.connect(config.db.uri, function(err, db) {
            if(!err) {
                db.collection('urls').drop(function(err) {
                    if(err) console.log('[TEST]: error cleaning up.')
                    db.close();
                });
            }
        });
    });


    it('can get status with /info/status', function(done) {
        superagent.get(address('/info/status'), function(err, res) {
            assert.ifError(err);
            is(res.status, 200);
            done();
        })
    })

    it('can add a valid redirect(302): /new/http://google.ca', function(done) {
        var expected = 'http://google.ca';
        superagent.get(address('/new/' + expected))
            .end(function(err, res) {
                assert.ifError(err);
                is(res.status, 200);
                is(res.body.original_url, expected);
                var shortUrl = res.body.short_url;

                superagent.get(shortUrl)
                    .redirects(0)
                    .end(function(err, res) {
                        is(res.status, 302);
                        is(res.header.location, expected);
                        done();
                    });
        });
    });

    it('rejects invalid urls: /new/invalid', function(done) {
        superagent.get(address('/new/invalid'), function(err, res) {
            assert.ifError(err);
            is(res.status, 200);
            de(res.body.error, 'URL invalid');
            done();
        });
    });
});
