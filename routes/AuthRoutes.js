const router = require('express').Router()
const AuthController = require('../contollers/AuthController')
const RefreshTokenController = require('../contollers/RefreshTokenController')
const UserTokenController = require('../contollers/UserTokenController')
const userValidationRules = require('../validationRules/userValidationRules')
const ValidationMiddleware = require('../middlewares/ValidationMiddleware').validate
const mailCheckMiddleware = require('../middlewares/mailCheckMiddleware')

router.route('/login').post(mailCheckMiddleware,AuthController.login)
router.route('/register').post(ValidationMiddleware(userValidationRules), AuthController.register)
router.route('/change-password/:token').post(UserTokenController.verifyUserTokenAndChangePassword)
router.route('/reset-token').post(RefreshTokenController.resetToken)
router.route('/reset-password').post(UserTokenController.createResetPasswordToken)

module.exports = router