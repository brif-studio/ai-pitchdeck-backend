module.exports = (sequelize, DataTypes) => {
    const PitchDeck = sequelize.define('pitch_deck',{
        id:{
            type:DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true
        },
        meta: {
            type:DataTypes.JSON
        }
    })
    return PitchDeck
}