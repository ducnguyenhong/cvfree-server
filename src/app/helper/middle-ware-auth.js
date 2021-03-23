const UserModel = require('../models/UserModel');
const CONSTANTS = require('../../constants')
const verifyToken = require('../helper/verify-token')
const jsonRes = require('../helper/json-response')

const authMDW = async (req, res, next) => {
  const bearerToken = req.headers.authorization;

  if (!bearerToken) {
		return res.status(401).json(jsonRes.error(401, "UNAUTHORIZED"))
  }
  
  const accessTokenFromHeader = bearerToken.split(' ')[1]
	const accessTokenSecret = CONSTANTS.accessTokenSecret;
	const verified = await verifyToken(
		accessTokenFromHeader,
		accessTokenSecret,
  );
  
	if (!verified) {
		return res.status(401).json(jsonRes.error(401, "UNAUTHORIZED"))
  }

	const user = await UserModel.findOne({username: verified.payload.username});
  req.userRequest = user
  next()
};

module.exports = authMDW