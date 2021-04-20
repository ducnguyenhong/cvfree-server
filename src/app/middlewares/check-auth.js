const UserModel = require('../models/UserModel');
const Constants = require('../../constants')
const verifyToken = require('../helper/verify-token')
const resError = require('../response/response-error')

const authMDW = async (req, res, next) => {
  const bearerToken = req.headers.authorization;

  if (!bearerToken || bearerToken.slice(0, 6) !== 'Bearer') {
		return resError(res, 'UNAUTHORIZED', 401)
  }
  
  const accessToken = bearerToken.split(' ')[1]
	const {accessTokenSecret} = Constants
	const verified = await verifyToken(accessToken, accessTokenSecret)
  
	if (!verified) {
		return resError(res, 'UNAUTHORIZED', 401)
  }

	const user = await UserModel.findOne({username: verified.payload.username});
  req.userRequest = user._doc
  next()
};

module.exports = authMDW