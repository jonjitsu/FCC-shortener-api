
module.exports = function(config) {
    var express = require('express'),
        app = express(),
        server;

    app
        .use(require('./middlewares/json-beautifier'))
        .use(require('./middlewares/easy-renderer'))
        .get('/', function(req, res) {
            res.render('index');
        });

    require('./apis/status')(app);
    require('./apis/shortener')(app, config);
    require('./apis/notfound')(app);

    return app;
};

