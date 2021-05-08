const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const getPagingData = require('../helper/get-paging-data')
const CvModel = require('../models/CvModel')
const JobModel = require('../models/JobModel')
const CompanyModel = require('../models/CompanyModel')
const ReportJobModel = require('../models/ReportJobModel')

class DashboardController {
  // [GET] /dashboard
  async show(req, res, next) {
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
}

module.exports = new DashboardController();