const UserModel = require('../models/UserModel');
const CONSTANTS = require('../../constants')
const verifyToken = require('../helper/verify-token')
const jsonRes = require('../helper/json-response')

const isAuth = async (req, res, next) => {
  const accessTokenFromHeader = req.headers.accesstoken;
	if (!accessTokenFromHeader) {
		return res.status(401).json(jsonRes.error(401, "UNAUTHORIZED"))
	}

	const accessTokenSecret = CONSTANTS.accessTokenSecret;

	const verified = await verifyToken(
		accessTokenFromHeader,
		accessTokenSecret,
	);
	if (!verified) {
		return res.status(401).json(jsonRes.error(401, "UNAUTHORIZED"))
  }

	const user = await UserModel.findOne({username: verified.payload.username});

	return user
};

module.exports = {isAuth}