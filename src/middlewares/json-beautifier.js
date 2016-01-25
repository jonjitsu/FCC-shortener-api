/**
   Express middleware that adds beautification of json through pretty query
   string.
 */
module.exports = function(req, res, next) {
    if(req.query.pretty!==undefined) req.app.set('json spaces', 4);
    next();
};
