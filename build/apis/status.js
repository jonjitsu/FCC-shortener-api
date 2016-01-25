
module.exports = function (app) {
    console.log('Adding status route');
    app.get('/info/status', function (req, res) {
        res.json({
            params: req.params,
            query: req.query,
            headers: req.headers,
            env: process.env
            // data:data
            // config: config
        });
    });
};