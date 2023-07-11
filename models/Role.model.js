module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('role', {
        id: {
            type:DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true
        },
        name:{
            type:DataTypes.STRING
        }
    },{
        underscored:true
    })
    return Role
}