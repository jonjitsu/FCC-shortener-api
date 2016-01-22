/**
   Express middleware that adds beautification of json through pretty query
   string.
 */
module.exports = function (req, res, next) {
    console.log(req.query.pretty);
    if (req.query.pretty !== undefined) req.app.set('json spaces', 4);
    next();
};