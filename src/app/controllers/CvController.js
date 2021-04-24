const CvModel = require("../models/CvModel");
const uuid = require('uuid');
const UserModel = require("../models/UserModel");
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
class CvController {

  // [GET] /cvs
  async showList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])

    CvModel.find()
      .then(cvs => {
        const { dataPaging, pagination } = getPagingData(req, cvs)
        const dataRes = dataPaging.map(item => {
          const { password, ...userRes } = item
          return userRes
        })
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /cvs/my-cvs/suggest
  async showMyCvsSuggest(req, res, next) {
    const { _id } = req.userRequest
    await checkUserTypeRequest(req, res, next, ['USER'])

    CvModel.find({creatorId: _id.toString(), status: 'ACTIVE'})
      .then(cvs => {
        const { dataPaging, pagination } = getPagingData(req, cvs)
        const dataRes = dataPaging.map(item => {
          const { _id, name, detail } = item
          return {
            value: _id,
            label: `${name} - ${detail.fullname}`.toUpperCase()
          }
        })
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /cvs/my-cvs/:id
  async showMyCvs(req, res, next) {
    const creatorId = req.params.id
    const { _id, type } = req.userRequest
    await checkUserTypeRequest(req, res, next, ['USER'])
    if (type === 'USER' && creatorId !== _id.toString()) {
      return resError(res, 'UNAUTHORIZED', 401)
    }

    CvModel.find({creatorId: _id.toString(), status: 'ACTIVE'})
      .then(cvs => {
        const { dataPaging, pagination } = getPagingData(req, cvs)
        const dataRes = dataPaging.map(item => {
          const { password, ...userRes } = item
          return userRes
        })
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /cvs/:id
  async showDetail(req, res) {
    const cvId = req.params.id
    CvModel.findOne({_id: cvId})
      .then(cv => {
        const { __v, ...dataRes } = cv._doc
        return resSuccess(res, {cvDetail: dataRes})
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /cvs
  async create(req, res) {
    await checkUserTypeRequest(req, res, next, ['USER'])
    const { _id, listCV, fullname, avatar, username, numberOfCreateCv } = req.userRequest
    
    if (numberOfCreateCv === 0) {
      return resError(res, 'OUT_OF_TURN_CREATE')
    }

    const newCv = new CvModel({ ...req.body, creatorId: _id, creator: {fullname, avatar, username}, candidateId: uuid.v4() })
    
    newCv.save()
      .then(cv => {
        const cvId = cv._doc._id
        UserModel.findOneAndUpdate({ _id }, { listCV: listCV && listCV.length > 0 ? [...listCV, cvId] : [cvId], numberOfCreateCv: numberOfCreateCv - 1 })
        resSuccess(res, {cvInfo: cv}, 'CREATED_CV_SUCCESS')
      })
      .catch(e => resError(res, e.message))
  }

  // [PUT] /cvs
  async update(req, res) {
    await checkUserTypeRequest(req, res, next, ['USER'])
    const cvId = req.params.id
    CvModel.findByIdAndUpdate(cvId, req.body)
      .then(cv => resSuccess(res, {cvInfo: cv}, 'UPDATED_CV_SUCCESS'))
      .catch(e => resError(res, e.message))
  }

  // [DELETE] /cvs/:id
  async delete(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['USER'])
    const cvId = req.params.id
    const { numberOfCreateCv, _id } = req.userRequest
    
    CvModel.findOneAndUpdate({_id: cvId}, {status: 'INACTIVE'})
      .then(() => {
        UserModel.findOneAndUpdate({ _id }, { numberOfCreateCv: numberOfCreateCv + 1 }, {new: true})
          .then(user => {
            resSuccess(res, {userInfo: user}, 'DELETED_CV_SUCCESS')
          })
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

}

module.exports = new CvController();
