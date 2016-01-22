var mongoose = require('mongoose'),
    // autoIncrement = require('mongodb-autoincrement'),

    urlSchema = new mongoose.Schema({
        // _id: {
        //     type: Number,
        //     required: true
        // },
        url: {
            type: String,
            required: true
        }
    });

// urlSchema.plugin(autoIncrement.mongoosePlugin);
// mongoose.plugin(autoIncrement.mongoosePlugin);

module.exports = urlSchema;
