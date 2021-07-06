const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const CvModel = require('../models/CvModel')
const JobModel = require('../models/JobModel')
const CompanyModel = require('../models/CompanyModel')
const UserModel = require('../models/UserModel')
const getPagingData = require('../helper/get-paging-data')

class AdminController {
  // [PUT] /admin/cvs/change-status/:id
  async changeStatusCv(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const cvId = req.params.id
    const status = req.body.status
    
    CvModel.findOneAndUpdate({_id: cvId}, {status})
      .then(user => {
        resSuccess(res, {userInfo: user}, status === 'ACTIVE' ? 'ACTIVE_CV_SUCCESS' : 'DEACTIVE_CV_SUCCESS')
      })
      .catch(e => resError(res, e.message))
  }

  // [PUT] /admin/jobs/:id
  async updateJob(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const jobId = req.params.id

    JobModel.findOneAndUpdate({ _id: jobId }, { ...req.body }, {new: true})
      .then(job => resSuccess(res, { jobDetail: job }, 'UPDATED_JOB_SUCCESS'))
      .catch(e => resError(res, e.message))
  }

  // [PUT] /admin/jobs/change-status/:id
  async changeStatusJob(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const jobId = req.params.id
    const status = req.body.status
    
    JobModel.findOneAndUpdate({_id: jobId}, {status})
      .then(user => {
        resSuccess(res, {userInfo: user}, status === 'ACTIVE' ? 'ACTIVE_JOB_SUCCESS' : 'DEACTIVE_JOB_SUCCESS')
      })
      .catch(e => resError(res, e.message))
  }

  // [PUT] /admin/companies/:id
  async updateCompany(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const companyId = req.params.id
    const { creatorId } = req.body

    UserModel.findOne({ id: creatorId })
      .then(user => {
        const newCreatorId = user._doc._id.toString()

        CompanyModel.findOne({ _id: companyId })
          .then(company => {
            if (company._doc.creatorId === newCreatorId) {
              CompanyModel.findOneAndUpdate({ _id: companyId }, { ...req.body}, {new: true})
                .then(companyUpdated => resSuccess(res, { companyDetail: companyUpdated }, 'UPDATED_COMPANY_SUCCESS'))
                .catch(e => resError(res, e.message))
            }
            else {
              UserModel.findOneAndUpdate({ _id: newCreatorId }, {companyId, isAdminOfCompany: true})
                .then(() => {
                  UserModel.findOneAndUpdate({ _id: company._doc.creatorId }, {companyId: "", isAdminOfCompany: false})
                    .then(() => {
                      CompanyModel.findOneAndUpdate({ _id: companyId }, { ...req.body, creatorId: newCreatorId}, {new: true})
                        .then(companyUpdated => resSuccess(res, { companyDetail: companyUpdated }, 'UPDATED_COMPANY_SUCCESS'))
                        .catch(e => resError(res, e.message))
                    })
                    .catch(e => resError(res, e.message))
                })
                .catch(e => resError(res, e.message))
            }
          })
          .catch(e => resError(res, e.message)) 
      })
      .catch(e => resError(res, e.message)) 
  }

  // [PUT] /admin/companies/change-status/:id
  async changeStatusCompany(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const companyId = req.params.id
    const status = req.body.status
    
    CompanyModel.findOneAndUpdate({_id: companyId}, {status})
      .then(user => {
        resSuccess(res, {userInfo: user}, status === 'ACTIVE' ? 'ACTIVE_COMPANY_SUCCESS' : 'DEACTIVE_COMPANY_SUCCESS')
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /admin/companies/:id
  async showCompanyDetail(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const companyId = req.params.id
    if (!companyId) {
      return resSuccess(res, {companyDetail: null}, 'NOT_EXISTS_COMPANY')
    }
    CompanyModel.findOne({_id: companyId})
      .then(company => {
        if (!company || company._doc.status === 'INACTIVE') {
          resSuccess(res, {companyDetail: null}, 'NOT_EXISTS_COMPANY')
        }

        UserModel.findOne({ _id: company._doc.creatorId })
          .then(user => {
            const { creator, ...dataRes } = company._doc
            const {fullname, id} = user._doc
            return resSuccess(res, { companyDetail: {...dataRes, creator: {...creator, fullname, id}} })
          })
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /admin/users/suggest
  async suggestUserList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    let objQuery = {}
    const {keyword, type, isAdminOfCompany} = req.query
    if (type) {
      objQuery.type = type
    }
    if (isAdminOfCompany === "false" || isAdminOfCompany === "true") {
      objQuery.isAdminOfCompany = isAdminOfCompany === "true"
    }
    if (keyword) {
      objQuery.name = new RegExp(keyword, "i")
    }
    UserModel.find(objQuery)
      .then(users => {
        const { dataPaging, pagination } = getPagingData(req, users)
        const dataRes = dataPaging.map(item => {
          return {
            value: item.id,
            label: item.fullname || item.email
          }
        })
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new AdminController();