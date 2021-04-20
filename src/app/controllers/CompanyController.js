const CompanyModel = require("../models/CompanyModel");
const jsonRes = require('../helper/json-response')
const UserModel = require('../models/UserModel')
const JobModel = require('../models/JobModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const getQueryParams = require('../helper/get-query-params')

class CompanyController {

  // [GET] /company
  async showList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])

    CompanyModel.find()
      .then(companies => {
        const { dataPaging, pagination } = getPagingData(req, companies)
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /company/suggest
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
          return {value: item.id, label: item.name}
        })
        // let dataRes = []
        // if (keyword) {
        //   dataRes = companySlice.map(item => {
        //     if (`${item.name}`.includes(keyword)) {
        //       return {value: item.id, label: item.name}
        //     }
        //   })
        // }
        // else {
        //   dataRes = companySlice.map(item => {
        //     return {value: item.id, label: item.name}
        //   })
        // }
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

  // [POST] /company
  async create(req, res) {
    const creatorId = req.userRequest._doc.id
    const newCompany = new CompanyModel({...req.body, creatorId})
    newCompany.save()
      .then((company) => {
        const companyId = company._doc._id
        UserModel.findOneAndUpdate({ id: creatorId }, { companyId })
          .then(() => {
            res.status(201).json(jsonRes.success(201, { companyInfo: newCompany }, "CREATED_COMPANY_SUCCESS"))
          })
          .catch((e) => {
            res.status(400).json(jsonRes.error(400, e.message))
          })
      })
      .catch((e) => {
        res.status(400).json(jsonRes.error(400, e.message))
      })
  }

  // [GET] /company/detail
  async showDetail(req, res, next) {
    const companyId = req.params.id
    if (!companyId) {
      return res.status(200).json(jsonRes.success(
        200,
        { companyDetail: null },
        "NOT_EXISTS_COMPANY"))
    }
    CompanyModel.findOne({_id: companyId})
      .then(companyDetail => {
        if (!companyDetail) {
          return res.status(200).json(jsonRes.success(
            200,
            { companyDetail: null },
            "NOT_EXISTS_COMPANY"))
        }

        const { ...dataRes } = companyDetail._doc
        return res.status(200).json(jsonRes.success(
          200,
          { companyDetail: dataRes },
          "GET_DATA_SUCCESS"
        ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

  // [GET] /company/:id/jobs
  async showListJob(req, res, next) {
    const companyId = req.params.id
    const page = parseInt(req.query.page) || 1
    const size = parseInt(req.query.size) || 10
    const start = (page - 1) * size
    const end = page * size
    
    JobModel.find({companyId, status: 'ACTIVE'})
      .then(jobs => {
        let totalPages = 0;
        if (jobs.length <= size) {
          totalPages = 1
        }
        if (jobs.length > size) {
          totalPages = (jobs.length % size === 0) ? (jobs.length / size) : Math.ceil(jobs.length / size) + 1
        }
        const dataRes = jobs.slice(start, end).map(item => {
          const { candidateApplied, ...jobsRes } = item._doc
          return jobsRes
        })
        return res.status(200).json(jsonRes.success(
          200,
          {
            items: dataRes,
            page,
            size,
            totalItems: jobs.length,
            totalPages
          },
          "GET_DATA_SUCCESS"
        ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

}

module.exports = new CompanyController();
