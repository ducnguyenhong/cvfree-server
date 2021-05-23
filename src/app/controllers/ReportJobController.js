const ReportJobModel = require('../models/ReportJobModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const JobModel = require('../models/JobModel')
const UserModel = require('../models/UserModel')
const CompanyModel = require('../models/CompanyModel')

class ReportJobController {

  // [GET] /report-job
  async showList(req, res, next) {
    checkUserTypeRequest(req, res, next, ['ADMIN'])
    ReportJobModel.find().sort({updatedAt: -1})
      .then(reports => {
        const { dataPaging, pagination } = getPagingData(req, reports)
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /report-job
  async reportJob(req, res) {
    const { _id: userRequestId, avatar: userRequestAvatar, email:userRequestEmail } = req.userRequest
    const { reporter, job, content } = req.body

    JobModel.findOne({ _id: job.id })
      .then(jobInfo => {
        if (!jobInfo) {
          resError(res, 'NOT_EXISTS_JOB')
        }
        const { creatorId, name: jobName } = jobInfo._doc
        
        UserModel.findOne({ _id: creatorId })
          .then(creatorInfo => {
            const { fullname: creatorName, email: creatorEmail, phone: creatorPhone, companyId, avatar: creatorAvatar } = creatorInfo._doc
            
            CompanyModel.findOne({ _id: companyId })
              .then(companyInfo => {
                const { name: companyName, logo: companyLogo } = companyInfo._doc
                
                const newData = {
                  reporter: {
                    id: userRequestId.toString(),
                    fullname: reporter.fullname,
                    avatar: userRequestAvatar,
                    phone: reporter.phone,
                    email: userRequestEmail
                  },
                  content,
                  creator: {
                    id: creatorId,
                    fullname: creatorName,
                    phone: creatorPhone,
                    email: creatorEmail,
                    avatar: creatorAvatar
                  },
                  company: {
                    id: companyId,
                    name: companyName,
                    logo: companyLogo
                  },
                  processStatus: 'WAITING',
                  job: {
                    id: job.id,
                    name: jobName
                  },
                  status: 'ACTIVE'
                }
                const newReportJob = new ReportJobModel(newData)
            
                newReportJob.save()
                  .then(() => {
                    UserModel.findOneAndUpdate({ _id: userRequestId }, { numberOfReportJob: 0 }, {new: true})
                      .then(() => resSuccess(res, null, 'REPORTED_JOB_SUCCESS'))
                      .catch(e => resError(res, e.message))
                  })
                  .catch(e => resError(res, e.message))
              })
              .catch(e => resError(res, e.message))
          })
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new ReportJobController();