const UserModel = require("../models/UserModel")
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const getQueryParams = require('../helper/get-query-params')
const checkExistsData = require('../helper/check-exists-data')
class UserController {

  // [GET] /users
  async showList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const objQuery = {}

    for (const [key, value] of Object.entries(getQueryParams(req))) {
      if (key && value && key !== 'page' && key !== 'size') {
        if (key === 'keyword') {
          objQuery.fullname = new RegExp(value, "i")
        }
        else if (key === 'verify') {
          if (verify === 'true') {
            objQuery.verify = true
          }
          if (verify === 'false') {
            objQuery.verify = false
          }
        }
        else {
          objQuery[`${key}`] = value
        }
      }
    }

    UserModel.find(objQuery)
      .then(users => {
        const { dataPaging, pagination } = getPagingData(req, users)
        const dataRes = dataPaging.map(item => {
          const { password, ...data } = item
          return data
        })
        return resSuccess(res, {
          items: dataRes,
          pagination
        })
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /users/:id
  async showDetail(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const {id} = req.params
    UserModel.findOne({_id: id})
      .then(user => {
        const { password, __v, ...dataRes } = user._doc
        return resSuccess(res, {userDetail: dataRes})
      })
      .catch(e => resError(res, e.message))
  }

  // [PUT] /users/:id
  async update(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['USER', 'EMPLOYER', 'ADMIN'])
    const { _id, type } = req.userRequest
    const { id } = req.params
    if (id !== _id.toString() && type !== 'ADMIN') {
      return resError(res, 'UNAUTHORIZED', 401)
    }
    const { fullname, email, phone, avatar, address, gender, birthday, avatarId } = req.body

    if (!(await checkExistsData(UserModel, 'phone', phone))) {
      resError(res, 'EXISTS_PHONE', 409)
    }

    if (!(await checkExistsData(UserModel, 'email', email))) {
      resError(res, 'EXISTS_EMAIL', 409)
    }

    let dataUpdate = {
      fullname, email, phone, avatar, address, gender, birthday, avatarId
    }
    if (type === 'ADMIN') {
      const { numberOfReportJob, numberOfCandidateOpening, numberOfCreateCv, numberOfPosting, numberOfRequestUpdateCompany, verify, status } = req.body
      dataUpdate = {...dataUpdate, numberOfReportJob, numberOfCandidateOpening, numberOfCreateCv, numberOfPosting, numberOfRequestUpdateCompany, verify, status}
    }
    
    UserModel.findOneAndUpdate({_id: id}, dataUpdate, {new: true})
      .then(user => {
        const { password, __v, ...dataRes } = user._doc
        return resSuccess(res, {userDetail: dataRes}, 'UPDATED_USER_INFO')
      })
      .catch(e => resError(res, e.message))
  }

  // [PUT] /users/change-password
  async changePassword(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['USER', 'EMPLOYER', 'ADMIN'])
    const {oldPassword, newPassword} = req.body
    const { _id, password } = req.userRequest

    if (oldPassword !== password) {
      return resError(res, 'INCORRECT_OLD_PASSWORD')
    }

    UserModel.findOneAndUpdate({ _id }, { password: newPassword })
      .then(() => resSuccess(res, null, 'CHANGED_PASSWORD_SUCCESS'))
      .catch(e => resError(res, e.message))
  }
}

module.exports = new UserController();
