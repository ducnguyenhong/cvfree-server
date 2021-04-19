const UserModel = require('../models/UserModel');
const CONSTANTS = require('../../constants')
const verifyToken = require('../helper/verify-token')

const getUserRequest = async (bearerToken) => {
  if (!bearerToken) {
		return null
  }
  
  const accessToken = bearerToken.split(' ')[1]
	const accessTokenSecret = CONSTANTS.accessTokenSecret
	const verified = await verifyToken( accessToken, accessTokenSecret )
  
	if (!verified) {
		return null
  }

	const user = await UserModel.findOne({username: verified.payload.username});
  return user
};

module.exports = getUserRequest