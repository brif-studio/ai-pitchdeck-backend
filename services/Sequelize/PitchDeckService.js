const SequelizeBaseService = require('./SequelizeBaseService')
const { pitchDecks } = require('../../loaders/index').db

class PitchDeckService extends SequelizeBaseService{
    constructor(){
        super(pitchDecks)
    }
}

module.exports = new PitchDeckService()