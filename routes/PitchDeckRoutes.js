const router = require('express').Router()
const PitchDeckController = require('../contollers/PitchDeckController')
const AuthMiddleware = require('../middlewares/AuthMiddleware').requireAuth

router.route('/').get(AuthMiddleware('Admin,User'), PitchDeckController.getAll)
router.route('/generate-images').get(PitchDeckController.createImages)
router.route('/:id').get(PitchDeckController.getById)

module.exports = router