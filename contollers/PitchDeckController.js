const httpStatus = require('http-status')
const PitchDeckService = require('../services/Sequelize/PitchDeckService')
const { generateImages } = require('../scripts/helpers/openaiHelper')
const { SuccessResult, SuccessDataResult, ErrorResult, ErrorDataResult } = require('../scripts/utils/results')

class PitchDeckController{
    async getAll(req, res){
        const data = await PitchDeckService.getAll()
        res.status(200).json(new SuccessDataResult(null, data))
    }

    async getById(req, res){
        const data = await PitchDeckService.getById(req.params.id)
        res.status(200).json(new SuccessDataResult(null, data))
    }

    async createImages(req, res){
        const data = await generateImages({
            prompt: "A cute baby sea otter",
            n: 2,
            size: "1024x1024",
          })
        res.status(200).json(new SuccessDataResult(null, data))
    }
}

module.exports = new PitchDeckController()