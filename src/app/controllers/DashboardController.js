const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const getPagingData = require('../helper/get-paging-data')
const CvModel = require('../models/CvModel')
const JobModel = require('../models/JobModel')
const CompanyModel = require('../models/CompanyModel')
const ReportJobModel = require('../models/ReportJobModel')
const ApplyManageModel = require('../models/ApplyManageModel')
const CandidateManageModel = require('../models/CandidateManageModel')

class DashboardController {
  // [GET] /dashboard
  async overview(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])

    let numberOfCv = null
    let listCv = []
    let numberOfJob = null
    let listJob = []
    let numberOfCompany = null
    let listCompany = []
    let listReportJob = []

    await CvModel.find({ status: 'ACTIVE' }).sort({ updatedAt: -1 })
      .then(cvs => {
        if (cvs && cvs.length > 0) {
          numberOfCv = cvs.length
          listCv = cvs.slice(0, 5)
        }
      })
      .catch(e => resError(res, e.message))
    
    await JobModel.find({ status: 'ACTIVE' }).sort({ updatedAt: -1 })
    .then(jobs => {
      if (jobs && jobs.length > 0) {
        numberOfJob = jobs.length
        listJob = jobs.slice(0, 5)
      }
    })
      .catch(e => resError(res, e.message))
    
    await CompanyModel.find({ status: 'ACTIVE' }).sort({ updatedAt: -1 })
    .then(companies => {
      if (companies && companies.length > 0) {
        numberOfCompany = companies.length
        listCompany = companies.slice(0, 5)
      }
    })
      .catch(e => resError(res, e.message))
    
    await ReportJobModel.find({ status: 'ACTIVE' }).sort({ updatedAt: -1 })
    .then(reports => {
      if (reports && reports.length > 0) {
        listReportJob = reports.slice(0, 5)
      }
    })
    .catch(e => resError(res, e.message))
    
    const dataRes = {
      statis: {
        cv: numberOfCv,
        job: numberOfJob,
        company: numberOfCompany
      },
      reportJobs: listReportJob,
      cvs: listCv,
      jobs: listJob,
      companies: listCompany
    }

    resSuccess(res, {dataDashboard: dataRes})
  }

  // [GET] /dashboard/users/:id/cvs
  async showListCvOfUser(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const creatorId = req.params.id

    CvModel.find({creatorId})
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

  // [GET] /dashboard/users/:id/applies
  async showListApplyOfUser(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const userId = req.params.id
  
    ApplyManageModel.findOne({userId})
      .then(applyManage => {
        if (!applyManage) {
          return resSuccess(res, {items: [], pagination: {page: 1, size: 10, totalItems: 0, totalPages: 0}})
        }

        const datas = applyManage.applies || []
        const { dataPaging, pagination } = getPagingData(req, datas)
        
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /dashboard/users/:id/candidate-manage
  async showListCandidateOfEmployer(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const employerId = req.params.id
  
    CandidateManageModel.findOne({employerId})
      .then(candidateManage => {
        if (!candidateManage) {
          return resSuccess(res, {item: [], pagination: {page: 1, size: 10, totalPages: 0, totalItems: 0}})
        }
        const datas = candidateManage.candidates || []
        let activeDatas = []
        for (let i = 0; i < datas.length; i++){
          if (datas[i]._doc.status === 'ACTIVE') {
            activeDatas.push(datas[i])
          }
        }
        const { dataPaging, pagination } = getPagingData(req, activeDatas)
        
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /dashboard/users/:id/jobs
  async showListJobOfEmployer(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    const creatorId = req.params.id
    
    JobModel.find({creatorId})
      .then(jobs => {
        const transformData = jobs.map(item => {
          const { candidateApplied, ...data } = item._doc
          let newCandidateApplied = []
          for (let i = 0; i < candidateApplied.length; i++){
            newCandidateApplied.push(candidateApplied[i])
          }
          return {...data, candidateApplied: newCandidateApplied}
        })
        const { dataPaging, pagination } = getPagingData(req, transformData, true)
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new DashboardController();