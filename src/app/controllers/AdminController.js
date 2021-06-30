const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const CvModel = require('../models/CvModel')
const JobModel = require('../models/JobModel')
const CompanyModel = require('../models/CompanyModel')

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

    CompanyModel.findOneAndUpdate({ _id: companyId }, { ...req.body }, {new: true})
      .then(job => resSuccess(res, { companyDetail: job }, 'UPDATED_COMPANY_SUCCESS'))
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
}

module.exports = new AdminController();