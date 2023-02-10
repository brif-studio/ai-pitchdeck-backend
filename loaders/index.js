const { connectDb } = require('./db')

module.exports = {
    db : connectDb()
}