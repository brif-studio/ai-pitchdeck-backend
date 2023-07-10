const config = require('./config')
const loaders = require('./loaders')
const express = require('express')
const cors = require('cors')
const { PitchDeckRoutes, AuthRoutes } = require('./routes')
require('express-async-errors')

config()

const app = express()
app.use(express.json())
app.use(cors())

app.listen(process.env.PORT, () => {
    console.log('Server is running...' )

    app.use('/api/pitch-decks', PitchDeckRoutes)
    app.use('/api/auth', AuthRoutes)

    const errorMiddleware = require('./middlewares/ErrorMiddleware')
    app.use(errorMiddleware)

})

