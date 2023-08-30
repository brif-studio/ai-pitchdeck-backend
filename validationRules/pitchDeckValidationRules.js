const { body } = require('express-validator')
module.exports = [
    body('companyDetails.nameSurname').isString().escape().withMessage('This field must be a string!'),
    body('companyDetails.nameSurname').notEmpty().withMessage('This field can not be null!'),
    body('companyDetails.title').isString().escape().withMessage('This field must be a string!'),
    body('companyDetails.title').notEmpty().withMessage('This field can not be null!'),
    body('companyDetails.email').isEmail().normalizeEmail().trim().escape().withMessage('This value is not a valid email!'),
    body('companyDetails.email').isString().withMessage('This field must be a string!'),
    body('companyDetails.email').notEmpty().withMessage('This field can not be null!'),
    body('companyDetails.phoneNumber').isMobilePhone().trim().escape().withMessage('This field must be a phone number!'),
    body('companyDetails.phoneNumber').isString().withMessage('This field must be a string!'),
    body('companyDetails.phoneNumber').notEmpty().withMessage('This field can not be null!'),
    body('companyDetails.startup-name').isString().escape().withMessage('This field must be a string!'),
    body('companyDetails.startup-name').notEmpty().withMessage('This field can not be null!'),
    body('companyDetails.date').isDate().trim().escape().withMessage('This field must be a date!'),
    body('firstQuestion').isString().withMessage('This field must be a string!'),
    body('firstQuestion').notEmpty().withMessage('This field can not be null!'),
    body('secondQuestion').isString().withMessage('This field must be a string!'),
    body('secondQuestion').notEmpty().withMessage('This field can not be null!'),
    body('thirdQuestion').isString().withMessage('This field must be a string!'),
    body('thirdQuestion').notEmpty().withMessage('This field can not be null!'),
    body('fourthQuestion').isString().withMessage('This field must be a string!'),
    body('fourthQuestion').notEmpty().withMessage('This field can not be null!'),
    body('fifthQuestion').isString().withMessage('This field must be a string!'),
    body('fifthQuestion').notEmpty().withMessage('This field can not be null!'),
    body('sixthQuestion').isString().withMessage('This field must be a string!'),
    body('sixthQuestion').notEmpty().withMessage('This field can not be null!'),
    body('seventhQuestion').isString().withMessage('This field must be a string!'),
    body('seventhQuestion').notEmpty().withMessage('This field can not be null!'),
    body('tenthQuestion').isString().withMessage('This field must be a string!'),
    body('tenthQuestion').notEmpty().withMessage('This field can not be null!'),
    body('costMetrics.unitTransaction').isString().withMessage('This field must be a string!'),
    body('costMetrics.unitTransaction').notEmpty().withMessage('This field can not be null!'),
    body('costMetrics.unitCosts').isString().withMessage('This field must be a string!'),
    body('costMetrics.unitCosts').notEmpty().withMessage('This field can not be null!'),
    body('costMetrics.totalCosts').isString().withMessage('This field must be a string!'),
    body('costMetrics.totalCosts').notEmpty().withMessage('This field can not be null!'),
    body('costMetrics.cac').isString().withMessage('This field must be a string!'),
    body('costMetrics.cac').notEmpty().withMessage('This field can not be null!'),
    body('revenueMetrics.unitTransaction').isString().withMessage('This field must be a string!'),
    body('revenueMetrics.unitTransaction').notEmpty().withMessage('This field can not be null!'),
    body('revenueMetrics.price').isString().withMessage('This field must be a string!'),
    body('revenueMetrics.price').notEmpty().withMessage('This field can not be null!'),
    body('revenueMetrics.totalRevenue').isString().withMessage('This field must be a string!'),
    body('revenueMetrics.totalRevenue').notEmpty().withMessage('This field can not be null!'),
    body('revenueMetrics.cltv').isString().withMessage('This field must be a string!'),
    body('revenueMetrics.cltv').notEmpty().withMessage('This field can not be null!'),
    body('timePlanDetails.enterpriseReleaseDate').isDate().trim().escape().withMessage('This field must be a date!'),
    body('timePlanDetails.companyReleaseDate').isDate().trim().escape().withMessage('This field must be a date!'),
    body('timePlanDetails.firstDemoReleaseDate').isDate().trim().escape().withMessage('This field must be a date!'),
    body('timePlanDetails.firstMapReleaseDate').isDate().trim().escape().withMessage('This field must be a date!'),
    body('timePlanDetails.firstInvestmentRoundDate').isDate().trim().escape().withMessage('This field must be a date!'),
    body('timePlanDetails.productFinalizedDate').isDate().trim().escape().withMessage('This field must be a date!'),
    
]