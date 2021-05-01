const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const RequestUpdateCompanyModel = require('../models/RequestUpdateCompanyModel')
const UserModel = require('../models/UserModel')
const sendEmail = require('../helper/send-email')

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

  // [GET] /request-update-company/:id
  async showDetail(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN', 'EMPLOYER'])
    const {id} = req.params

    RequestUpdateCompanyModel.findOne({_id: id})
      .then(request => {
        return resSuccess(res, {requestDetail: request})
      })
      .catch(e => resError(res, e.message))
  }

  // [PUT] /request-update-company/update-process/:id
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

  // [DELETE] /request-update-company/:id
  async deactive(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const {id} = req.params

    RequestUpdateCompanyModel.findOneAndUpdate({_id: id}, {status: 'INACTIVE'})
      .then(() => resSuccess(res, null, 'DEACTIVE_REQUEST_SUCCESS'))
      .catch(e => resError(res, e.message))
  }

  // [POST] /request-update-company/ban/:id
  async ban(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const { id } = req.params
    const { employerRequestedId } = req.body

    const sendMailToEmployer = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }
    
    UserModel.findOne({ _id: employerRequestedId })
      .then(employer => {
        const { beWarned, email, fullname } = employer._doc
        if (!beWarned) {
          RequestUpdateCompanyModel.findOneAndUpdate({_id: id}, {processStatus: 'BANNED'})
            .then(() => {
              const mailOptions = {
                from: 'cvfreecontact@gmail.com',
                to: email,
                subject: `CVFREE - Yêu cầu cập nhật thông tin công ty bị từ chối`,
                text: `Xin chào ${fullname}.

Yêu cầu thay đổi thông tin công ty của bạn là hoàn toàn không hợp lệ. Tài khoản của bạn đã bị cảnh cáo.
Nếu bị cảnh cáo 2 lần, tài khoản sẽ bị khóa và bạn sẽ không thể đăng nhập vào CVFREE.
Vui lòng tuân thủ nguyên tắc cộng đồng. Xin cảm ơn.

Trân trọng,
CVFREE`}
              const isSentEmail = sendMailToEmployer(mailOptions)

              if (isSentEmail) {
                UserModel.findOneAndUpdate({ _id: employerRequestedId },{ beWarned: true })
                  .then(() => resSuccess(res, null, 'BANNED_REQUEST_SUCCESS'))
                  .catch(e => resError(res, e.message))
              }
              else {
                return resError(res, 'SEND_EMAIL_FAIL')
              }
            
          })
          .catch(e => resError(res, e.message))
        }
        else {
          RequestUpdateCompanyModel.findOneAndUpdate({_id: id}, {processStatus: 'BANNED'})
            .then(() => {
              const mailOptions = {
                from: 'cvfreecontact@gmail.com',
                to: email,
                subject: `CVFREE - Yêu cầu cập nhật thông tin công ty bị từ chối`,
                text: `Xin chào ${fullname}.

Yêu cầu thay đổi thông tin công ty của bạn là hoàn toàn không hợp lệ. Tài khoản của bạn đã bị cảnh cáo lần thứ 2.
Tài khoản sẽ bị khóa và bạn sẽ không thể đăng nhập vào CVFREE.
Xin cảm ơn.

Trân trọng,
CVFREE`}
              const isSentEmail = sendMailToEmployer(mailOptions)

              if (isSentEmail) {
                UserModel.findOneAndUpdate({ _id: employerRequestedId }, {beWarned: true, status: 'INACTIVE' })
                  .then(() => resSuccess(res, null, 'BANNED_REQUEST_SUCCESS'))
                  .catch(e => resError(res, e.message))
              }
              else {
                return resError(res, 'SEND_EMAIL_FAIL')
              }
            
          })
          .catch(e => resError(res, e.message))
        }
      })
      .catch(e => resError(res, e.message))

    
  }

}

module.exports = new RequestUpdateCompanyController();
