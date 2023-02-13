const router = require('express').Router()
const AuthController = require('../contollers/AuthController')
const RefreshTokenController = require('../contollers/RefreshTokenController')
const UserTokenController = require('../contollers/UserTokenController')

router.route('/login').post(AuthController.login)
router.route('/register').post(AuthController.register)
router.route('/reset-token').post(RefreshTokenController.resetToken)
router.route('/reset-password').post(UserTokenController.createResetPasswordToken)
router.route('/chage-password/:token').post(UserTokenController.verifyUserTokenAndChangePassword)

module.exports = router