module.exports = (sequelize, DataTypes) => {
    const RefreshToken = sequelize.define('refreshToken',{
        id:{
            type:DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true
        },
        token:{
            type:DataTypes.STRING
        },
        expirationDate:{
            type:DataTypes.DATE
        }
    },{
        underscored:true
    })
    return RefreshToken
}