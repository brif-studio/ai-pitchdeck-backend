module.exports = (sequelize, DataTypes) => {
    const VerificationCode = sequelize.define('verification_code',{
        id:{
            type:DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true
        },
        code:{
            type: DataTypes.STRING
        },
        isVerified:{
            type:DataTypes.BOOLEAN
        },
        codeDeadline:{
            type: DataTypes.DATE
        }
    },{
        underscored:true
    })
    return VerificationCode
}