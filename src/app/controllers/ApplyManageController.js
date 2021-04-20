const ApplyManageModel = require('../models/ApplyManageModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')

class ApplyController {
  // [GET] /apply-manage
  async showListApplyManage(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['USER'])
    const userId = req.userRequest._id.toString()
  
    ApplyManageModel.findOne({userId})
      .then(applyManage => {
        if (!applyManage) {
          return resSuccess(res, {items: [], pagination: {page: 1, size: 10, totalItems: 0, totalPages: 0}})
        }

        const datas = applyManage.applies || []
        const { dataPaging, pagination } = getPagingData(req, datas)
        
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new ApplyController();