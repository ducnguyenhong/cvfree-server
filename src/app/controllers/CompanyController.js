const CompanyModel = require("../models/CompanyModel");
const UserModel = require('../models/UserModel')
const JobModel = require('../models/JobModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const RequestUpdateCompanyModel = require('../models/RequestUpdateCompanyModel')

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
          UserModel.findOneAndUpdate({ _id: creatorId }, { companyId, isAdminOfCompany: true }, {new: true})
            .then(user => resSuccess(res, {companyInfo: company, userDetail: user}, 'CREATED_COMPANY_SUCCESS'))
            .catch(e => resError(res, e.message))
        })
        .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [PUT] /companies/employer
  async updateCompanyOfEmployer(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const {_id: userRequestId, companyId, fullname: userRequestName, avatar: userRequestAvatar, numberOfRequestUpdateCompany, email: userRequestEmail} = req.userRequest

    CompanyModel.findOne({ _id: companyId })
      .then(company => {
        if (!company) {
          resError(res, 'NOT_EXISTS_COMPANY')
        }

        const { listStaff } = company
        let role = null
        for (let i = 0; i < listStaff.length; i++){
          if (listStaff[i]._doc.id === userRequestId.toString()) {
            role = listStaff[i]._doc.role
          }
        }

        if (!role) {
          resError(res, 'UNAUTHORIZED', 401)
        }

        if (role === 'ADMIN') {
          const {_id, ...dataUpdate} = req.body
          CompanyModel.findOneAndUpdate({ _id: companyId }, { ...dataUpdate })
            .then(() => resSuccess(res, null, 'UPDATED_COMPANY_INFO'))
            .catch(e => resError(res, e.message))
        }

        if (role === 'MEMBER') {
          if (!numberOfRequestUpdateCompany) {
            resError(res, 'CAN_NOT_REQUEST_UPDATE')
          }
          const { _id: companyId, name, logo, creatorId } = company._doc
          
          UserModel.findOne({ _id: creatorId })
            .then(userAdmin => {
              const {_id: adminId, fullname: adminName, avatar: adminAvatar, email: adminEmail} = userAdmin._doc
              const newRequestUpdate = new RequestUpdateCompanyModel({
                status: 'ACTIVE',
                processStatus: 'WAITING',
                userAdmin: {id: adminId.toString(), fullname: adminName, avatar: adminAvatar, email: adminEmail},
                content: { ...req.body.content },
                companyId: companyId.toString(),
                rootInfo: {id: companyId.toString(), name, logo},
                userRequest: {
                  id: userRequestId,
                  fullname: userRequestName,
                  avatar: userRequestAvatar,
                  employeeIdCard: req.body.userRequest.employeeIdCard,
                  position: req.body.userRequest.position,
                  email: userRequestEmail
                }
              })

              UserModel.findOneAndUpdate({ _id: userRequestId }, { numberOfRequestUpdateCompany: numberOfRequestUpdateCompany - 1 })
                .then(() => {
                  newRequestUpdate.save()
                    .then(() => resSuccess(res, 'RECEIVED_REQUEST_UPDATE'))
                    .catch(e => resError(res, e.message))
                })
                .catch(e => resError(res, e.message))
            })
            .catch(e => resError(res, e.message))
        }
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
