const { body } = require('express-validator')
module.exports = [
    body('userName').notEmpty().trim().escape().withMessage('This field can not be null!'),
    body('userName').isString().withMessage('This field must be a string!'),
    body('userName').isLength({ min:5, max:20}).withMessage('Wrong userName length!'),
    body('email').isEmail().normalizeEmail().trim().escape().withMessage('This value is not a valid email!'),
    body('email').isString().withMessage('This field must be a string!'),
    body('email').notEmpty().withMessage('This field can not be null!'),
    body('password').notEmpty().isStrongPassword().withMessage('Please enter a strong password!')
]