const CandidateManageModel = require('../models/CandidateManageModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')

class CandidateManageController {
  // [GET] /candidate-manage
  async showListCandidateManage(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const {_id} = req.userRequest
  
    CandidateManageModel.findOne({employerId: _id})
      .then(candidateManage => {
        if (!candidateManage) {
          return resSuccess(res, {item: [], pagination: {page: 1, size: 10, totalPages: 0, totalItems: 0}})
        }
        const datas = candidateManage.candidates || []
        const { dataPaging, pagination } = getPagingData(req, datas)
        
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new CandidateManageController();