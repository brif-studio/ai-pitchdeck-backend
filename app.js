const config = require('./config')
const loaders = require('./loaders')
const express = require('express')
const { PitchDeckRoutes } = require('./routes')

config()

const app = express()
app.use(express.json())

app.listen(process.env.PORT, () => {
    console.log('Server is running...' )

    app.use('/pitch-decks', PitchDeckRoutes)

})
