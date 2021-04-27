const CompanyModel = require("../models/CompanyModel");
const UserModel = require('../models/UserModel')
const JobModel = require('../models/JobModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')

class CompanyController {

  // [GET] /companies
  async showList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])

    CompanyModel.find()
      .then(companies => {
        const { dataPaging, pagination } = getPagingData(req, companies)
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /companies/employer
  async showCompanyOfEmployer(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const {companyId} = req.userRequest
    if (!companyId) {
      return resSuccess(res, { companyDetail: null } , 'NOT_EXISTS_COMPANY')
    }
    
    CompanyModel.findOne({_id: companyId})
      .then(company => {
        if (!company) {
          return resSuccess(res, { companyDetail: null } , 'NOT_EXISTS_COMPANY')
        }

        const { ...dataRes } = company._doc
        return resSuccess(res, {companyDetail: dataRes})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /companies/suggest
  async suggest(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const objQuery = {}
    const keyword = req.query.keyword
    if (keyword) {
      objQuery.name = new RegExp(keyword, "i")
    }
    
    CompanyModel.find(objQuery)
      .then(companies => {
        const { dataPaging, pagination } = getPagingData(req, companies)
        const dataRes = dataPaging.map(item => {
          return {value: item._id, label: item.name}
        })
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /companies
  async create(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const creatorId = req.userRequest._id
    const newCompany = new CompanyModel({ ...req.body, creatorId, listStaff: [{ id: creatorId, role: 'ADMIN' }] })
    
    UserModel.findOne({ _id: creatorId })
      .then(user => {
        if (user._doc.companyId) {
          return resError(res, 'USER_REQUEST_HAVE_COMPANY')
        }
        newCompany.save()
        .then(company => {
          const companyId = company._doc._id
          UserModel.findOneAndUpdate({ _id: creatorId }, { companyId }, {new: true})
            .then(user => resSuccess(res, {companyInfo: company, userDetail: user}, 'CREATED_COMPANY_SUCCESS'))
            .catch(e => resError(res, e.message))
        })
        .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /companies/:id
  async showDetail(req, res, next) {
    const companyId = req.params.id
    if (!companyId) {
      return resSuccess(res, {companyDetail: null}, 'NOT_EXISTS_COMPANY')
    }
    CompanyModel.findOne({_id: companyId})
      .then(company => {
        if (!company) {
          resSuccess(res, {companyDetail: null}, 'NOT_EXISTS_COMPANY')
        }

        const { ...dataRes } = company._doc
        return resSuccess(res, { companyDetail: dataRes })
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /companies/:id/jobs
  async showListJob(req, res, next) {
    const companyId = req.params.id
    
    JobModel.find({companyId, status: 'ACTIVE'})
      .then(jobs => {
        const { dataPaging, pagination } = getPagingData(req, jobs)
        const dataRes = dataPaging.map(item => {
          const { candidateApplied, ...jobsRes } = item
          return jobsRes
        })
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => resError(res, e.message))
  }

}

module.exports = new CompanyController();
