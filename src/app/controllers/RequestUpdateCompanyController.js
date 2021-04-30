const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const RequestUpdateCompanyModel = require('../models/RequestUpdateCompanyModel')

class RequestUpdateCompanyController {

  // [GET] /request-update-company
  async showList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])

    RequestUpdateCompanyModel.find()
      .then(requests => {
        const { dataPaging, pagination } = getPagingData(req, requests)
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [PUT] /request-update-company/:id
  async updateProcessStatus(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN, EMPLOYER'])
    const { type } = req.userRequest
    const {id} = req.params
    const { processStatus } = req.body
    
    if (type === 'EMPLOYER' && (!['APPROVED', 'DINIED'].includes(processStatus))) {
      resError(res, 'UNAUTHORIZED', 401)
    }

    RequestUpdateCompanyModel.findOneAndUpdate({_id: id}, {processStatus})
      .then(() => resSuccess(res, null, 'UPDATED_PROCESS_STATUS_SUCCESS'))
      .catch(e => resError(res, e.message))
  }

}

module.exports = new RequestUpdateCompanyController();
