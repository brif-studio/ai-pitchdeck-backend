const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()
const dbConfig = require('../config/database')[process.env.NODE_ENV]



const connectDb = () => {

    const sequelize = new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password, {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        operatorsAliases: false
    }
    );

    sequelize.authenticate()
        .then(() => {
            console.log('connected..')
        })
        .catch(err => {
            console.log('Error' + err)
        })


    const db = {}
    db.Sequelize = Sequelize
    db.sequelize = sequelize

    db.pitchDecks = require('../models/PitchDeck.model')(sequelize, DataTypes)
    db.users = require('../models/User.model')(sequelize, DataTypes)
    db.roles = require('../models/Role.model')(sequelize, DataTypes)
    db.verificationCodes = require('../models/VerificationCode.model.js')(sequelize, DataTypes)
    db.refreshTokens = require('../models/RefreshToken.model')(sequelize, DataTypes)
    db.userTokens = require('../models/UserToken.model')(sequelize, DataTypes)
    db.userWallets = require('../models/UserWallet.model')(sequelize, DataTypes)


    //UserTokens
    db.userTokens.belongsTo(db.users, {
        foreignKey: 'userId',
        targetKey:'id'
    })
    db.users.hasOne(db.userTokens, {
        foreignKey: 'userId',
        targetKey:'id'
    })
    //UserTokens-End

    //RefreshTokens
    db.refreshTokens.belongsTo(db.users, {
        foreignKey: 'userId',
        targetKey:'id'
    })
    db.users.hasOne(db.refreshTokens, {
        foreignKey: 'userId',
        targetKey:'id'
    })
    //RefreshTokens-End

    //UserRoles
    db.users.belongsToMany(db.roles,{through:'user_roles'})
    db.roles.belongsToMany(db.users,{through:'user_roles'})

    db.users.hasMany(db.verificationCodes)
    db.verificationCodes.belongsTo(db.users)
    //UserRoles-Ends

    db.users.hasMany(db.pitchDecks)
    db.pitchDecks.belongsTo(db.users)
 
    db.users.hasMany(db.userWallets)
    db.userWallets.belongsTo(db.users)

    return db
}

module.exports = {
    connectDb
}