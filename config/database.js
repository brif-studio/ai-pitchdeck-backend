require('dotenv').config()
module.exports = {
    "development": {
        "storage":"./db/db-test.sqlite",
        "dialect": "sqlite"
    },
    "production": {
        "storage":"./db/db.sqlite",
        "dialect": "sqlite"
    }
  }