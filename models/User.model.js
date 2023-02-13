module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id:{
            type:DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true
        },
        email:{
            type:DataTypes.STRING
        },
        userName:{
            type:DataTypes.STRING
        },
        password:{
            type:DataTypes.STRING
        },
        emailConfirmed:{
            type:DataTypes.BOOLEAN
        }
    },{
        underscored:true
    })
    return User
}