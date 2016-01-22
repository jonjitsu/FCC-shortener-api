var urlSchema = require('./url-schema');
autoIncrement = require('mongoose-auto-increment');

module.exports = function (mongoose) {

    autoIncrement.initialize(mongoose.connection);
    urlSchema.plugin(autoIncrement.plugin, 'Url');

    return mongoose.model('Url', urlSchema, 'urls');
};