const FeedbackModel = require('../models/FeedbackModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const getPagingData = require('../helper/get-paging-data')

class CandidateController {
  // [GET] /feedback
  async showList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])

    FeedbackModel.find()
      .then(feedbacks => {
        const { dataPaging, pagination } = getPagingData(req, feedbacks)
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /feedback
  async create(req, res, next) {
    const newFeedback = new FeedbackModel({ ...req.body })
    newFeedback.save()
      .then(() => resSuccess(res, null, 'CREATED_FEEDBACK_SUCCESS'))
      .catch(e => resError(res, e.message))
  }
}

module.exports = new CandidateController();