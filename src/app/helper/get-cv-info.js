const CvModel = require('../models/CvModel')
const resError = require('../response/response-error')

const getCvInfo = (res, objQuery) => {
  return CvModel.findOne(objQuery)
    .then(cv => {
      if (!cv) {
        resError(res, 'NOT_EXISTS_CV')
      }
      return cv._doc
    })
    .catch(e => resError(res, e.message))
}

module.exports = getCvInfo