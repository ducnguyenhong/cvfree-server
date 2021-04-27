const ReportJobModel = require('../models/ReportJobModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')

class ReportJobController {

  // [POST] /report-job
  async reportJob(req, res, next) {
    const newReportJob = new ReportJobModel(req.body)

    newReportJob.save()
      .then(() => resSuccess(res, null, 'REPORTED_JOB_SUCCESS'))
      .catch(e => resError(res, e.message))
  }
}

module.exports = new ReportJobController();