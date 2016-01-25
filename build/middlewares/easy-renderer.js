var fs = require('fs'),
    render = function (tmp) {
    return fs.readFileSync('view/' + tmp + '.html').toString();
},
    easyRenderer = function (req, res, next) {
    res.render = function (tpl) {
        res.send(render(tpl));
    };
    next();
};

module.exports = easyRenderer;