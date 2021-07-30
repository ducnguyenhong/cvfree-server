const UserModel = require('../models/UserModel');
const Constants = require('../../constants')
const verifyToken = require('../helper/verify-token')
const resError = require('../response/response-error')
const AuthModel = require('../models/AuthModel');
const moment = require('moment');

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

  const user = await UserModel.findOne({ username: verified.payload.username });

  const authUser = await AuthModel.findOne({ userId: user._doc._id.toString() });

  if (accessToken !== authUser._doc.token) {
		return resError(res, 'ACCOUNT_LOGGED_IN_SOMEWHERE_ELSE', 401)
  }

  if (authUser._doc.expiredAt <= moment().valueOf()) {
		return resError(res, 'EXPIRED_TOKEN', 400)
  }

  req.userRequest = user._doc
  next()
};

module.exports = authMDW