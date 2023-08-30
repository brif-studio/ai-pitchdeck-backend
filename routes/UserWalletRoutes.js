const router = require('express').Router()
const UserWalletController = require('../contollers/UserWalletController')
const AuthMiddleware = require('../middlewares/AuthMiddleware').requireAuth
const ValidationMiddleware = require('../middlewares/ValidationMiddleware').validate

router.route('/getUserWallet').get(UserWalletController.getUserWallet)

module.exports = router