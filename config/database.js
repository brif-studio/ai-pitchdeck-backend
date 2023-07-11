require('dotenv').config()
module.exports = {
    "development": {
        "storage":"./db/db-test.sqlite3",
        "dialect": "sqlite"
    },
    "production": {
        "storage":"./db/db.sqlite3",
        "dialect": "sqlite"
    }
  }