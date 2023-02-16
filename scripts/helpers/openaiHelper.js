const { Configuration, OpenAIApi } = require("openai")
require('dotenv').config()
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const createCompletion = async (options) => {
    const response = await openai.createCompletion(options)
    return response.data.choices[0].text
}

const generateImages = async(options) => {
    const response = await openai.createImage(options)
    return response.data.data[0].url
}

module.exports = {createCompletion, generateImages, openai}

