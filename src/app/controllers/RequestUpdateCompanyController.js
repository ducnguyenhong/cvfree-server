const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const RequestUpdateCompanyModel = require('../models/RequestUpdateCompanyModel')
const UserModel = require('../models/UserModel')
const sendEmail = require('../helper/send-email')
const Constants = require('../../constants')
const moment = require('moment')

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

  // [GET] /request-update-company
  async showListOfCompany(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const {companyId} = req.userRequest

    RequestUpdateCompanyModel.find({companyId})
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

  // [POST] /request-update-company/accept/:id
  async accept(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const { id } = req.params

    const sendMailToEmployer = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }

    RequestUpdateCompanyModel.findOne({ _id: id })
      .then(request => {
        const { userRequest } = request._doc
        
        RequestUpdateCompanyModel.findOneAndUpdate({_id: id}, {processStatus: 'APPROVED'})
          .then(() => {
            const mailOptions = {
              from: 'cvfreecontact@gmail.com',
              to: userRequest.email,
              subject: `CVFREE - Yêu cầu cập nhật thông tin công ty đã được chấp nhận`,
              text: `Xin chào ${userRequest.fullname}.

Yêu cầu thay đổi thông tin công ty của bạn đã được chấp nhận.
Bạn có thể đăng nhập vào CVFREE để xem thông tin chi tiết (${Constants.clientURL}/sign-in)

Trân trọng,
CVFREE`}
            const isSentEmail = sendMailToEmployer(mailOptions)
    
            if (isSentEmail) {
              return resSuccess(res, null, 'ACCEPT_REQUEST_SUCCESS')
            }
            else {
              return resError(res, 'SEND_EMAIL_FAIL')
            }
          })
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /request-update-company/reject/:id
  async reject(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const { id } = req.params
    const {reasonReject} = req.body

    const sendMailToEmployer = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }

    RequestUpdateCompanyModel.findOne({ _id: id })
      .then(request => {
        const { userRequest, userAdmin } = request._doc
        
        RequestUpdateCompanyModel.findOneAndUpdate({_id: id}, {processStatus: 'REJECTED', reasonRejectOfAdminCompany: reasonReject, expiredAt: moment().add(3, 'days')})
          .then(() => {
            const mailOptions = {
              from: 'cvfreecontact@gmail.com',
              to: userRequest.email,
              subject: `CVFREE - Yêu cầu cập nhật thông tin công ty đã bị từ chối`,
              text: `Xin chào ${userRequest.fullname}.

Yêu cầu thay đổi thông tin công ty của bạn đã bị từ chối bởi người đã đăng ký công ty.
Lý do người đăng ký công ty đưa ra: ${reasonReject}.

Nếu bạn vẫn muốn tiếp tục yêu cầu này, chúng tôi đề xuất cách giải quyết cho bạn như sau:

Bước 1: Hãy đảm bảo rằng bạn và người đã đăng ký công ty (${userAdmin.fullname} - ${userAdmin.email}) đều là nhân viên trong cùng công ty.
Hãy liên hệ trực tiếp họ để chỉnh sửa thông tin công ty.

Bước 2: Nếu bạn muốn khiếu nại, hãy sử dụng email công ty (không sử dụng email cá nhân) và gửi email đến chúng tôi theo mẫu:
- Tiêu đề: Tên_Công_Ty_Của_Bạn yêu cầu cập nhật thông tin.
- Nội dung: hãy cố gắng mô tả rõ nhất vấn đề mà bạn đang gặp phải
- Và gửi đến email hỗ trợ của chúng tôi cvfreecontact@gmail.com

Nếu bạn không muốn tiếp tục yêu cầu (không khiếu nại), yêu cầu này sẽ tự động hết hạn trong vòng 3 ngày tới.

Chúng tôi luôn đảm bảo quyền lợi công bằng cho tất cả người dùng. Xin cảm ơn!

Trân trọng,
CVFREE`}
            const isSentEmail = sendMailToEmployer(mailOptions)
    
            if (isSentEmail) {
              return resSuccess(res, null, 'REJECT_REQUEST_SUCCESS')
            }
            else {
              return resError(res, 'SEND_EMAIL_FAIL')
            }
          })
          .catch(e => resError(res, e.message))
      })
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
