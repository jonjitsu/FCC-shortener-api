"use strict";

var config = require('configuror')(),
    app = require('./app.js')(config),
    server = app.listen(config.app.port, function () {
    let port = server.address().port;
    console.log('Up an runnin');
});