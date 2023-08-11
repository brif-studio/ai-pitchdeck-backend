const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

const connectDb = () => {

    const sequelize = new Sequelize(
        'mysql', // Varsayılan XAMPP veritabanı adı
        'root', // Varsayılan XAMPP veritabanı kullanıcısı
        '', // Varsayılan XAMPP veritabanı kullanıcısının parolası (boş bırakılabilir)
        {
            host: 'localhost', // XAMPP'nin kurulu olduğu sunucu adresi
            dialect: 'mysql', // MySQL kullanılıyor
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );

    sequelize.authenticate()
        .then(() => {
            console.log('connected..')
        })
        .catch(err => {
            console.log("aaaaaaaaa")
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

    db.sequelize.sync({force:false})
        .then(() => {
            console.log('yes re-sync done!')
        })

    return db
}

module.exports = {
    connectDb
}