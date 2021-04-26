const UserModel = require('../models/UserModel')
const resError = require('../response/response-error')

const getUserInfo = (objQuery) => {
  UserModel.findOne(objQuery)
    .then(user => {
      if (!user) {
        return null
      }
      return user._doc
    })
    .catch(e => resError(res, e.message))
}

module.exports = getUserInfo