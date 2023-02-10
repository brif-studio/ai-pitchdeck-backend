const router = require('express').Router()
const PitchDeckController = require('../contollers/PitchDeckController')

router.route('/').get(PitchDeckController.getAll)
router.route('/:id').get(PitchDeckController.getById)

module.exports = router