const httpStatus = require('http-status')
const PitchDeckService = require('../services/Sequelize/PitchDeckService')
const { SuccessResult, SuccessDataResult, ErrorResult, ErrorDataResult } = require('../scripts/utils/results')

class PitchDeckController{
    async getAll(req, res){
        const data = await PitchDeckService.getAll()
        res.status(httpStatus[200]).json(new SuccessDataResult(null, data))
    }

    async getById(req, res){
        const data = await PitchDeckService.getById(req.params.id)
        res.status(httpStatus[200]).json(new SuccessDataResult(null, data))
    }
}

module.exports = new PitchDeckController()