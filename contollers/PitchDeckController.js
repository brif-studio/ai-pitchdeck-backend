const httpStatus = require('http-status')
// const PitchDeckService = require('../services/Sequelize/PitchDeckService')
const { createChatCompletion, generateImages } = require('../scripts/helpers/openaiHelper')
const { SuccessResult, SuccessDataResult, ErrorResult, ErrorDataResult } = require('../scripts/utils/results')
const { decodeToken } = require('../scripts/helpers/hashHelper')
const { AuthError } = require('../scripts/utils/Errors')
const chatMessages = require('../const/chatMessages')
require('express-async-errors')

class PitchDeckController {
  async getAll(req, res) {
    const data = await PitchDeckService.getAll()
    res.status(200).json(new SuccessDataResult(null, data))
  }

  async getChat(req, res) {
    const data = req.body
    const answer = await createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          "role": "system",
          "content": "You are an assistant of a company called Brif. This company is making pitch decks with the help of AI. Users are answering 10 questions and the answers are used to create and analyze the company that is answering and want to create a pitch deck. companies might have trouble with some of the questions because they might not know some of the terms. When they have questions, they will come to you to answer their questions. Your duty is answering users' questions clear, short, and simple. You can not answer questions that are out of context. For example, if someone asks the president of the USA; you can not answer this. you should say ‘this question is out of the context, i can not assist with that kind of questions please ask me about business, pitch decks, economics, marketplace, target customers, problems around the world, solutions, metrics, time planning topics. etc.’ as an answer to those kinds of regular questions. your duty is not answering regular questions. It must be about business, pitch decks, economics, marketplace, target customers, problems around the world, solutions, metrics, time planning etc."
        },
        {
          "role": "user",
          "content": '${data.quesiton}'
        }
      ],
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
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
    const pitchDeckInformations = await getPitchDeckInformations(responses);
    const pitchDeckSlides = await generatePitchDeckSlides(pitchDeckInformations.picthDeck, pitchDeckInformations.images, responses);
    const pitchDeck = {
      "user-id": `${userId}`,
      "template": "pitch-deck",
      "slides": pitchDeckSlides
    }
    const pitchDeckJson = JSON.stringify(pitchDeck)
    const picthDeckForAdd = { userId: userId, meta: pitchDeckJson }
    const addedPitchDeck = await PitchDeckService.add(picthDeckForAdd)
    res.status(200).json(new SuccessDataResult(null, addedPitchDeck))
  }

  async createImages(req, res) {
    const data = await generateImages({
      prompt: "A cute baby sea otter",
      n: 1,
      size: "1024x1024",
    })
    res.status(200).json(new SuccessDataResult(null, data))
  }
}


const getPitchDeckInformations = async (responses) => {

  const companyAnalyzerMessages = chatMessages.companyAnalyzerMessages
  companyAnalyzerMessages.push({
    "role": "user",
    "content": `${responses.firstQuestion}, ${responses.secondQuestion}, ${responses.thirdQuestion}, ${responses.fourthQuestion}, ${responses.fifthQuestion}, ${responses.sixthQuestion}, ${responses.seventhQuestion}`
  })
  const companyAnalyzer = await createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: companyAnalyzerMessages,
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  let pitchDeckFinalMessages = chatMessages.pitchDeckFinalMessages
  pitchDeckFinalMessages.push({
    "role": "user",
    "content": `${responses.firstQuestion}, ${responses.secondQuestion}, ${responses.thirdQuestion}, ${responses.fourthQuestion}, ${responses.fifthQuestion}, ${responses.sixthQuestion}, ${responses.seventhQuestion}; ${companyAnalyzer}`
  })

  const pitchDeckFinal = await createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages: pitchDeckFinalMessages,
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  console.log(pitchDeckFinal, 'pitchDeckFinal')
  const finalResponses = JSON.parse(pitchDeckFinal)

  let dallePromterMessages = chatMessages.dallePromterMessages
  dallePromterMessages.push({
    "role": "user",
    "content": `${companyAnalyzer}, ${finalResponses[0].image}, ${finalResponses[1].image}, ${finalResponses[2].image}, ${finalResponses[3].image}, ${finalResponses[4].image}, ${finalResponses[5].image}, ${finalResponses[6].image}`
  })

  const dalleResponses = await createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages: dallePromterMessages,
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  console.log(dalleResponses, 'dalleResponses')
  const dalleFinalResponses = JSON.parse(dalleResponses)

  let images = []
  for (let i = 0; i < dalleFinalResponses.length; i++) {
    let image = await generateImages({
      prompt: `${dalleFinalResponses[i].prompt}`,
      n: 1,
      size: '1024x1024'
    })
    images.push(image)
  }

  return {
    images: images,
    picthDeck : finalResponses
  }
}

const generatePitchDeckSlides = async (answers,images, responses) => {
  const pitchDeckSlides = []
  pitchDeckSlides.push({
    "slide-type": 'introducing',
    "company-details": {
      "text": answers[0].text,
      "name-surname": responses.companyDetails.nameSurname,
      "title": responses.companyDetails.title,
      "email": responses.companyDetails.email,
      "phone-number": responses.companyDetails.phoneNumber,
      "startup-name": responses.companyDetails["startup-name"],
      "date": responses.companyDetails.date
    }
  })
  pitchDeckSlides.push({
    "slide-text": answers[1].text,
    "slide-images": [{
      "image-url": images[1]
    }]
  })
  pitchDeckSlides.push({
    "slide-text": answers[2].text,
    "slide-images": [{
      "image-url": images[2]
    }]
  })
  pitchDeckSlides.push({
    "slide-text": answers[3].text,
    "slide-images": [{
      "image-url": images[3]
    }]
  })
  pitchDeckSlides.push({
    "slide-text": answers[4].text,
    "slide-images": [{
      "image-url": images[4]
    }]
  })
  pitchDeckSlides.push({
    "slide-text": answers[5].text,
    "slide-images": [{
      "image-url": images[5]
    }]
  })
  pitchDeckSlides.push({
    "slide-text": answers[6].text,
    "slide-images": [{
      "image-url": images[6]
    }]
  })
  pitchDeckSlides.push({
    "slide-type": "cost-metrics",
    "slide-text": {
      "text":answers[7].text,
      "unit-transaction": responses.costMetrics.unitTransaction,
      "unit-costs": responses.costMetrics.unitCosts,
      "total-costs": responses.costMetrics.totalCosts,
      "cac": responses.costMetrics.cac
    }
  })
  pitchDeckSlides.push({
    "slide-type": "revenue-metrics",
    "slide-text": {
      "text":answers[8].text,
      "unit-transaction": responses.revenueMetrics.unitTransaction,
      "price": responses.revenueMetrics.price,
      "total-revenue": responses.revenueMetrics.totalRevenue,
      "cltv": responses.revenueMetrics.cltv
    }
  })
  pitchDeckSlides.push({
    "slide-text": answers[9].text,
    "css-code": answers.tenthSlideTextAsCss,
    "time-plan-details": {
      "enterprise-release-date": responses.timePlanDetails.enterpriseReleaseDate,
      "company-release-date": responses.timePlanDetails.companyReleaseDate,
      "first-demo-release-date": responses.timePlanDetails.firstDemoReleaseDate,
      "first-map-release-date": responses.timePlanDetails.firstMapReleaseDate,
      "first-investment-round-date": responses.timePlanDetails.firstInvestmentRoundDate,
      "product-finalized-date": responses.timePlanDetails.productFinalizedDate
    }
  })
  return pitchDeckSlides

}

module.exports = new PitchDeckController();