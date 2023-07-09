const router = require('express').Router()
const PitchDeckController = require('../contollers/PitchDeckController')
const AuthMiddleware = require('../middlewares/AuthMiddleware').requireAuth
const pitchDeckValidationRules = require('../validationRules/pitchDeckValidationRules')
const ValidationMiddleware = require('../middlewares/validationMiddleware').validate

router.route('/').get(AuthMiddleware('Admin'), PitchDeckController.getAll)
router.route('/getByUserId').get(AuthMiddleware('Admin,User'),PitchDeckController.getByUserId)
router.route('/:id').get(AuthMiddleware('Admin,User'),PitchDeckController.getById)
router.route('/add').post(ValidationMiddleware(pitchDeckValidationRules), AuthMiddleware('Admin,User'),PitchDeckController.generatePitchDeck)
router.route('/chat').post(AuthMiddleware('Admin,User'),PitchDeckController.getChat)

module.exports = router