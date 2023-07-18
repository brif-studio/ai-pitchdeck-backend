module.exports = (sequelize, DataTypes) => {
    const UserWallet = sequelize.define('userWallet', {
        id: {
            type:DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true
        },
        creditCount: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        }
    },{
        underscored:true
    })

    return UserWallet
}