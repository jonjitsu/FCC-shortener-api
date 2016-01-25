var assert = require('chai').assert,
    is = assert.strictEqual,
    de = assert.deepEqual,
    superagent = require('superagent'),

    config = require('configuror')({env: 'test'}),
    app = require('../src/app')(config),
    mongodb = require('mongodb')
;

describe('app', function() {
    var server, db,
        port = 3017,
        testAddress = 'http://localhost:' + port.toString(),
        address = function(path) {
            return testAddress + path;
        },
        dropUrls = function(done) {
            db.collection('urls').drop(function(err) {
                if(err && err.errmsg!=='ns not found') console.log('[EST]: error cleaning up.', err);
                done();
            });
        };

    beforeEach(function() {
        server = app.listen(port)
    });
    afterEach(function() {
        server.close();
    });

    before(function(done) {
        mongodb.MongoClient.connect(config.db.uri, function(err, dbInstance) {
            if(err) throw err;
            db = dbInstance;
            done();
        });
    });
    after(function() {

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
                        dropUrls(done)
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


    it('allows invalid urls when forced: /new/invalid?allow=true', function(done) {
        superagent.get(address('/new/invalid'))
                       .query({ allow: true})
                       .end(function(err, res) {
                           assert.ifError(err);
                           is(res.status, 200);
                           is(res.body.original_url, 'invalid');
                           done();
                       });
    });
});
