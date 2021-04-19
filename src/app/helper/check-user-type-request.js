const resError = require('../response/response-error')

const checkUserTypeRequest = (req, res, next, validType) => {
  const userType = req.userRequest._doc.type
  let check = false
  for (let i = 0; i < validType.length; i++){
    if (`${validType[i]}`.includes(userType)) {
      check = true
    }
  }
  if (!check) {
    return resError(res, 'UNAUTHORIZED', 401)
  }
  else next
}

module.exports = checkUserTypeRequest