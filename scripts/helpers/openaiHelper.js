const { Configuration, OpenAIApi } = require("openai")
require('dotenv').config()
const { storage, bucket } = require('../config/firebase')
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

    fetch(response.data.data[0].url)
      .then(res => res.buffer())
      .then(buffer => {
        const imageRef = bucket.child('images/image.jpg');
        return imageRef.put(buffer);
      })
      .then(snapshot => {
        return snapshot.ref.getDownloadURL();
      })
      .then(url => {
        console.log('Uploaded image URL:', url);
      })
      .catch(error => {
        console.error('Error uploading image:', error);
      });

    return url
}

module.exports = {createCompletion, generateImages, openai}

