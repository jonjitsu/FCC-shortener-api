module.exports = {
    app: {
        port: process.env.PORT || 3000
    },
    db: {
        uri: process.env.MONGOLAB_URI || 'mongodb://localhost:30001/ushorty'
    }
};
