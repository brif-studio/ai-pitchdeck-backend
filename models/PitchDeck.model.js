module.exports = (sequelize, DataTypes) => {
    const PitchDeck = sequelize.define('pitchDeck',{
        id:{
            type:DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true
        },
        meta: {
            type:DataTypes.JSON
        },
        isCreated: {
            type:DataTypes.BOOLEAN,
        }
    },{
        underscored:true
    })
    return PitchDeck
}