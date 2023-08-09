const { Configuration, OpenAIApi } = require("openai")
require('dotenv').config()
const { storage } = require('../../config/firebase')
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const axios = require('axios')

const openai = new OpenAIApi(configuration)

const createChatCompletion = async (options) => {
  const response = await openai.createChatCompletion(options)
  return response.data.choices[0].message.content
}

const generateImages = async (options) => {
  const randomId = Math.random().toString(36).substring(2);
  const storageRef = ref(storage, `images/${randomId}.png`);
  const response = (await openai.createImage(options)).data.data[0].url
  const image = await axios.get(response, { responseType: 'arraybuffer' })
  await uploadBytes(storageRef, image.data).then((snapshot) => {
    console.log('Uploaded a raw string!');
  })
  return await getDownloadURL(storageRef)
}

module.exports = { createChatCompletion, generateImages, openai }

