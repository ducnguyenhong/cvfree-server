const UserModel = require('../models/UserModel')
const resError = require('../response/response-error')

const getUserInfo = (res, objQuery) => {
  return UserModel.findOne(objQuery)
    .then(user => {
      if (!user) {
        return resError(res, 'NOT_EXISTS_USER')
      }
      return user._doc
    })
    .catch(e => resError(res, e.message))
}

module.exports = getUserInfo