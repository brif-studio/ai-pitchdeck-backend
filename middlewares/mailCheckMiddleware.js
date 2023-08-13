const UserService = require('../services/Sequelize/UserService')



const mailCheckMiddleware = async (req, res, next) => {
    const { emailOrUserName } = req.body

    const user = await UserService.getByUserNameOrEmail(emailOrUserName)
    if (user) {
        if (user.emailConfirmed == true) {
            next()
        } else {
            res.status(401).json({ err: "mail onayı hata" })

        }

    } else {
        res.status(404).json({ err: "kulanıcı yok" })
    }
}


module.exports = mailCheckMiddleware;

