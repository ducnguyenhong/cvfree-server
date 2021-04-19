const UserModel = require("../models/UserModel")
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const getQueryParams = require('../helper/get-query-params')
class UserController {

  // [GET] /users
  async showList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const objQuery = {}

    for (const [key, value] of Object.entries(getQueryParams(req))) {
      if (key && value && key !== 'page' && key !== 'size') {
        if (key === 'keyword') {
          objQuery.fullname = value
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
          const { password, _id, ...data } = item
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
    const {_id} = req.params
    UserModel.findOne({_id})
      .then(user => {
        const { password, _id, __v, ...dataRes } = user._doc
        return resSuccess(res, {user: dataRes})
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new UserController();
