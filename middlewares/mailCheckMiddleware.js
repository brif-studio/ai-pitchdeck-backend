const jwt = require('jsonwebtoken')

const mailCheckMW = async (req, res, next) => {
  const token = req.rd.token;
  const responseData=req.rd
  if (!token) {
    return res.status(401)
  } else {
    let mailCheck = jwt.verify(token, process.env.TOKEN_SECRET).mailCon

    if (mailCheck == true) {
      return res.status(200).json(new SuccessDataResult('Login successfull!', responseData))

    } else {
      return res.status(403).json({ error: 'mail not confirmed' });

    }
  }
};

module.exports = mailCheckMW;
