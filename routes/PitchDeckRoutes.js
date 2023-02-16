const router = require('express').Router()
const PitchDeckController = require('../contollers/PitchDeckController')
const AuthMiddleware = require('../middlewares/AuthMiddleware').requireAuth

router.route('/').get(AuthMiddleware('Admin'), PitchDeckController.getAll)
router.route('/getByUserId').get(AuthMiddleware('Admin,User'),PitchDeckController.getByUserId)
router.route('/:id').get(AuthMiddleware('Admin,User'),PitchDeckController.getById)
router.route('/add').post(AuthMiddleware('Admin,User'),PitchDeckController.generatePitchDeck)

module.exports = router