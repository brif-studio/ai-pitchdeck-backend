const httpStatus = require('http-status')
const PitchDeckService = require('../services/Sequelize/PitchDeckService')
const UserWalletService = require('../services/Sequelize/UserWalletService')
const { createCompletion, generateImages } = require('../scripts/helpers/openaiHelper')
const { SuccessResult, SuccessDataResult, ErrorResult, ErrorDataResult } = require('../scripts/utils/results')
const { decodeToken } = require('../scripts/helpers/hashHelper')
const { AuthError } = require('../scripts/utils/Errors')
const rabbitmqHelper = require('../scripts/helpers/rabbitmqHelper')
require('express-async-errors')

class PitchDeckController {
    async getAll(req, res) {
        const data = await PitchDeckService.getAll()
        res.status(200).json(new SuccessDataResult(null, data))
    }

    async getChat(req, res) {
        const data = req.body
        const answer = await createCompletion({
            model: 'text-davinci-003',
            prompt: `${data.question}-make the explanation in a few sentences.`,
            temperature: 1,
            max_tokens: 300
        })
        res.status(200).json(new SuccessDataResult(null, answer))
    }

    async getById(req, res) {
        const data = await PitchDeckService.getById(req.params.id)
        res.status(200).json(new SuccessDataResult(null, data))
    }

    async getByUserId(req, res) {
        const userId = decodeToken(req.headers.authorization.split(' ')[1]).id
        const data = await PitchDeckService.getFiltered({ userId: userId })
        res.status(200).json(new SuccessDataResult(null, data))
    }

    async generatePitchDeck(req, res) {
        const userId = decodeToken(req.headers.authorization.split(' ')[1]).id
        const responses = req.body
        await UserWalletService.checkEnoughCredit(userId)
        // const pitchDeckInformation = await getPitchDeckInformations(responses)
        // const pitchDeckSlides = await generatePitchDeckSlides(pitchDeckInformation, responses)
        // const pitchDeck = {
        //     "user-id":`${userId}`,
        //     "template":"pitch-deck",
        //     "slides":pitchDeckSlides
        // }
        // const pitchDeckJson = JSON.stringify(pitchDeck)
        const picthDeckForAdd = { userId: userId, isCreated: false }
        const addedPitchDeck = await PitchDeckService.add(picthDeckForAdd)
        await UserWalletService.decreaseUserCredit(userId)
        const rabbitmqData = { responses: responses, pitchDeck: addedPitchDeck, userToken: req.headers.authorization }
        await rabbitmqHelper.publishToExchange('sys.pitchdeck', JSON.stringify(rabbitmqData))
        res.status(200).json(new SuccessDataResult(null, addedPitchDeck))
    }

    async updatePitchDeck(req, res) {
        const userId = decodeToken(req.headers.authorization.split(' ')[1]).id
        const pitchDeck = req.body
        const updatedPitchDeck = await PitchDeckService.update(pitchDeck, { userId: userId })
        res.status(200).json(new SuccessDataResult(null, updatedPitchDeck))
    }

    async createImages(req, res) {
        const data = await generateImages({
            prompt: "A cute baby sea otter",
            n: 1,
            size: "1024x1024",
        })
        res.status(200).json(new SuccessDataResult(null, data))
    }

    async deletePitchDeck(req, res) {
        const userId = decodeToken(req.headers.authorization.split(' ')[1]).id
        const { pitchDeckId } = req.body
        const removedPitchDeck = await PitchDeckService.delete(pitchDeckId, { userId: userId })
        await UserWalletService.increaseUserCredit(userId)
        res.status(200).json(new SuccessDataResult('PitchDeck deleted', removedPitchDeck))
    }
}

// const getPitchDeckInformations = async (responses) => {
//     const firstSlideText = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Split this text ${responses.firstQuestion} into these 
//         #namesurname #email #phonenumber #startupname 
//         keywords. Result as json format.`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const secondSlideImageText = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Get the gist of these problems and put them into
//         sentences for an artist can understand and draw.
//        Problems:${responses.secondQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const secondSlideImage = await generateImages({
//         prompt: `${secondSlideImageText}`,
//         n: 1,
//         size: '1024x1024'
//     })
//     // const problemKeywords = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Get main keyword from this problem ${responses.secondQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     const problemExplanation = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Explain this problem ${responses.secondQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const thirdSlideImageText = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Get the gist of these solutions and put them into
//         sentences for an artist can understand and draw.
//        ${responses.thirdQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const thirdSlideImage = await generateImages({
//         prompt: `${thirdSlideImageText}`,
//         n: 1,
//         size: '1024x1024'
//     })
//     // const solutionKeywords = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Get main keyword from this solutions ${responses.thirdQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     const solutionExplanation = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Explain this solution ${responses.thirdQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const fourthSlideImageText = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Get the gist of these value prospositon and put them into
//         sentences for an artist can understand and draw.
//         ${responses.fourthQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const fourthSlideImage = await generateImages({
//         prompt: `${fourthSlideImageText}`,
//         n: 1,
//         size: '1024x1024'
//     })
//     // const valuePropositionKeywords = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Get main keyword from this solutions ${responses.fourthQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     const valuePropositionExplanation = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Explain this value prospositon ${responses.fourthQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const fifthSlideImageText = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Get the gist of these underlying magics and put them into
//         sentences for an artist can understand and draw.
//         ${responses.fifthQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const fifthSlideImage = await generateImages({
//         prompt: `${fifthSlideImageText}`,
//         n: 1,
//         size: '1024x1024'
//     })
//     // const underlyingMagicKeywords = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Get main keyword from this underlying magic ${responses.fifthQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     const underlyingMagicExplanation = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Explain this text that is about underlying magic ${responses.fifthQuestion}
//         Get this keywords:
//         targetMarket, makrketingactivities, 
//         yourSolution, costomer, beneffits`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const sixthSlideImageText = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Get the gist of this text and put them into
//         sentences for an artist can understand and draw
//         ${responses.sixthQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const sixthSlideImage = await generateImages({
//         prompt: `${sixthSlideImageText}`,
//         n: 1,
//         size: '1024x1024'
//     })
//     // const targetCustomerKeywords = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Get main keyword from this text ${responses.sixthQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     const targetCustomerExplanation = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Explain this text that about target customers ${responses.sixthQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const pitchDeckKeywords = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Exract the Pitch Deck keywords ${responses.sixthQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const seventhSlideImageText = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Get the gist of these market plan and put them into
//         sentences for an artist can understand and draw. ${responses.seventhQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const seventhSlideImage = await generateImages({
//         prompt: `${seventhSlideImageText}`,
//         n: 1,
//         size: '1024x1024'
//     })
//     const marketPlanExplanation = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Explain this text that about market plan ${responses.seventhQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     // const eighthSlideImageText = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Get the gist of this text and put them into
//     //     sentences for an artist can understand and draw.       
//     //     ${responses.eighthQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     // const costMetricsKeywords = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Get main keyword from this text ${responses.eighthQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     // const costMetricsExplanation = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Explain this text that about cost metrics ${responses.eighthQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     // const keyMetcricsKeywords = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt:`Exract the keymetrics as keywords ${responses.sixthQuestion}`,
//     //     temperature:1,
//     //     max_tokens:300
//     // })
//     // const ninthSlideText = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Get the gist of this text and put them into
//     //     sentences for an artist can understand and draw.      
//     //     ${responses.ninthQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     // const revenueMetricsKeywords = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Get main keyword from this text ${responses.ninthQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     // const revenueMetricsExplanation = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt: `Explain this text that is about revenue metrics ${responses.ninthQuestion}`,
//     //     temperature: 1,
//     //     max_tokens:300
//     // })
//     // const revenueKeyMetcricsKeywords = await createCompletion({
//     //     model:'text-davinci-003',
//     //     prompt:`Exract the keymetrics as keywords ${responses.ninthQuestion}`,
//     //     temperature:1,
//     //     max_tokens:300
//     // })
//     const tenthSlideTextAsCss = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `${responses.tenthQuestion} make this timeplan as a css table
//         take parts date by date
//         ${responses.tenthQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     const timePlanExplanation = await createCompletion({
//         model: 'text-davinci-003',
//         prompt: `Explain this text that is about timeplan ${responses.tenthQuestion}`,
//         temperature: 1,
//         max_tokens: 300
//     })
//     return {
//         firstSlideText, secondSlideImageText, secondSlideImage, problemExplanation, thirdSlideImageText,
//         thirdSlideImage, solutionExplanation, fourthSlideImageText, fourthSlideImage, valuePropositionExplanation, fifthSlideImageText,
//         fifthSlideImage, underlyingMagicExplanation, sixthSlideImageText, sixthSlideImage, targetCustomerExplanation, pitchDeckKeywords,
//         seventhSlideImageText, seventhSlideImage, marketPlanExplanation, tenthSlideTextAsCss, timePlanExplanation
//     }
// }

// const generatePitchDeckSlides = async (answers, responses) => {
//     const pitchDeckSlides = []
//     pitchDeckSlides.push({
//         "slide-type": 'introducing',
//         "company-details": {
//             "name-surname": responses.companyDetails.nameSurname,
//             "title": responses.companyDetails.title,
//             "email": responses.companyDetails.email,
//             "phone-number": responses.companyDetails.phoneNumber,
//             "startup-name": responses.companyDetails.startupName,
//             "date": responses.companyDetails.date
//         }
//     })
//     pitchDeckSlides.push({
//         "slide-text": answers.problemExplanation,
//         "slide-images": [{
//             "image-url": answers.secondSlideImage
//         }]
//     })
//     pitchDeckSlides.push({
//         "slide-text": answers.solutionExplanation,
//         "slide-images": [{
//             "image-url": answers.thirdSlideImage
//         }]
//     })
//     pitchDeckSlides.push({
//         "slide-text": answers.valuePropositionExplanation,
//         "slide-images": [{
//             "image-url": answers.fourthSlideImage
//         }]
//     })
//     pitchDeckSlides.push({
//         "slide-text": answers.underlyingMagicExplanation,
//         "slide-images": [{
//             "image-url": answers.fifthSlideImage
//         }]
//     })
//     pitchDeckSlides.push({
//         "slide-text": answers.targetCustomerExplanation,
//         "slide-images": [{
//             "image-url": answers.sixthSlideImage
//         }]
//     })
//     pitchDeckSlides.push({
//         "slide-text": answers.marketPlanExplanation,
//         "slide-images": [{
//             "image-url": answers.seventhSlideImage
//         }]
//     })
//     pitchDeckSlides.push({
//         "slide-type": "cost-metrics",
//         "slide-text": {
//             "unit-transaction": responses.costMetrics.unitTransaction,
//             "unit-costs": responses.costMetrics.unitCosts,
//             "total-costs": responses.costMetrics.totalCosts,
//             "cac": responses.costMetrics.cac
//         }
//     })
//     pitchDeckSlides.push({
//         "slide-type": "revenue-metrics",
//         "slide-text": {
//             "unit-transaction": responses.revenueMetrics.unitTransaction,
//             "price": responses.revenueMetrics.price,
//             "total-revenue": responses.revenueMetrics.totalRevenue,
//             "cltv": responses.revenueMetrics.cltv
//         }
//     })
//     pitchDeckSlides.push({
//         "slide-text": answers.timePlanExplanation,
//         "css-code": answers.tenthSlideTextAsCss,
//         "time-plan-details": {
//             "enterprise-release-date": responses.timePlanDetails.enterpriseReleaseDate,
//             "company-release-date": responses.timePlanDetails.companyReleaseDate,
//             "first-demo-release-date": responses.timePlanDetails.firstDemoReleaseDate,
//             "first-map-release-date": responses.timePlanDetails.firstMapReleaseDate,
//             "first-investment-round-date": responses.timePlanDetails.firstInvestmentRoundDate,
//             "product-finalized-date": responses.timePlanDetails.productFinalizedDate
//         }
//     })
//     return pitchDeckSlides

// }

module.exports = new PitchDeckController()