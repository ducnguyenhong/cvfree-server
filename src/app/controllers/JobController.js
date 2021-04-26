const JobModel = require("../models/JobModel");
const ApplyManageModel = require('../models/ApplyManageModel')
const CompanyModel = require('../models/CompanyModel')
const getUserRequest = require('../helper/get-user-request')
const UserModel = require('../models/UserModel')
const sendEmail = require('../helper/send-email')
const Constants = require('../../constants')
const CvModel = require('../models/CvModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')

class JobController {

  // [GET] /jobs
  async showList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])
    JobModel.find()
      .then(jobs => {
        const { dataPaging, pagination } = getPagingData(req, jobs)
        const dataRes = dataPaging.map(item => {
          const { creatorId, candidateApplied, ...jobsRes } = item
          return jobsRes
        })
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /jobs/employer
  async showListJobOfEmployer(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN', 'EMPLOYER'])
    const employerId = req.params.id
    const { _id, type } = req.userRequest
    if (type === 'EMPLOYER' && employerId !== _id.toString()) {
      return resError(res, 'UNAUTHORIZED', 401)
    }
    
    JobModel.find({creatorId: _id, status: 'ACTIVE'})
      .then(jobs => {
        const transformData = jobs.map(item => {
          const { candidateApplied, ...data } = item._doc
          let newCandidateApplied = []
          for (let i = 0; i < candidateApplied.length; i++){
            newCandidateApplied.push(candidateApplied[i].cvId)
          }
          return {...data, candidateApplied: newCandidateApplied}
        })
        const { dataPaging, pagination } = getPagingData(req, transformData, true)
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /jobs/newest
  async showListNewest(req, res) {
    JobModel.find({status: 'ACTIVE'}).sort({ updatedAt: -1 })
      .then(jobs => {
        const { dataPaging, pagination } = getPagingData(req, jobs)
        const dataRes = dataPaging.map(item => {
          const { creatorId, candidateApplied, ...jobsRes } = item
          return jobsRes
        })
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /jobs
  async create(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const { _id, companyId, avatar, fullname, numberOfPosting } = req.userRequest

    CompanyModel.findOne({ _id: companyId })
      .then(company => {
        const {name, logo} = company._doc
        const newJob = new JobModel({
          ...req.body,
          company: { logo, name, id: companyId },
          creator: { avatar, fullname },
          creatorId: _id
        })
        newJob.save()
          .then(() => {
            UserModel.findOneAndUpdate({ _id }, { numberOfPosting: numberOfPosting - 1 })
              .then(() => resSuccess(res, {jobInfo: newJob}, 'CREATED_JOB_SUCCESS'))
              .catch(e => resError(res, e.message))
          })
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [PUT] /jobs/:id
  async update(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const jobId = req.params.id
    const userId = req.userRequest._id

    JobModel.findOne({ _id: jobId })
      .then(job => {
        if (!job) {
          resError(res, 'NOT_EXISTS_JOB')
        }
        const { creatorId } = job._doc
        if (creatorId !== userId.toString()) {
          return resError(res, 'UNAUTHORIZED', 401)
        }

        JobModel.findOneAndUpdate({ _id: jobId }, { ...req.body }, {new: true})
          .then(job => resSuccess(res, { jobDetail: job }, 'UPDATED_JOB_SUCCESS'))
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [DELETE] /jobs/:id
  async delete(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const jobId = req.params.id
    const userId = req.userRequest._id
    const numberOfPosting = req.userRequest.numberOfPosting

    JobModel.findOne({ _id: jobId })
      .then(job => {
        if (!job) {
          resError(res, 'NOT_EXISTS_JOB')
        }
        const { creatorId } = job._doc
        if (creatorId !== userId.toString()) {
          return resError(res, 'UNAUTHORIZED', 401)
        }

        JobModel.findOneAndUpdate({ _id: jobId }, { status: 'INACTIVE'})
          .then(job => {
            UserModel.findOneAndUpdate({ _id: userId }, { numberOfPosting: numberOfPosting + 1 })
              .then(() => {
                resSuccess(res, { jobDetail: job }, 'DELETED_JOB_SUCCESS')
              })
              .catch(e => resError(res, e.message))
          })
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /jobs/:id
  async showDetail(req, res, next) {
    const bearerToken = req.headers.authorization;
    const jobId = req.params.id
    let user = null
    if (bearerToken) {
      user = await getUserRequest(bearerToken)
    }

    JobModel.findOne({_id: jobId})
      .then(job => {
        if (!job) {
          return resSuccess(res, { jobDetail: null }, 'NOT_EXISTS_JOB')
        }

        const { candidateApplied, company, ...dataRes } = job._doc

        CompanyModel.findOne({ _id: company.id })
          .then(company => {
            const jobDetail = {
              ...dataRes,
              company: {
                id: company.id,
                name: company.name,
                logo: company.logo
              }
            }
            if (user && user._doc.type === 'USER') {
              let isApplied = false // nếu có token, check xem job đó đã apply chưa
              const listCV = user._doc.listCV
              if (listCV && listCV.length > 0 && candidateApplied && candidateApplied.length > 0) {
                for (let i = 0; i < candidateApplied.length; i++){
                  for (let j = 0; j < listCV.length; j++){
                    if (candidateApplied[i].cvId === listCV[j]) {
                      isApplied = true
                    }
                  }
                }
              }
              jobDetail.isApplied = isApplied
            }
            return resSuccess(res, { jobDetail})
          })
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /jobs/:id/candidate-apply
  async candidateApply(req, res, next) {
    const jobId = req.params.id
    const cvId = req.body.cvId
    const { type, _id: userId } = req.userRequest
    
    if (type !== 'USER') {
      return resError(res, 'UNAUTHORIZED', 401)
    }

    const sendMailToEmployer = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }

    JobModel.findOne({_id: jobId})
      .then(job => {
        if (!job) {
          return resError(res, 'NOT_EXISTS_JOB')
        }

        CvModel.findOne({ _id: cvId })
          .then(cv => {
            if (!cv) {
              return resError(res, 'NOT_EXISTS_CV')
            }
            const { candidateApplied, creatorId, name } = job._doc

            JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: [...candidateApplied, {cvId, appliedAt: new Date()}] })
              .then(() => {
                UserModel.findOne({ _id: creatorId })
                  .then(creator => {
                    const { email, fullname } = creator._doc
                    const  mailOptions = {
                      from: 'cvfreecontact@gmail.com',
                      to: email,
                      subject: 'CVFREE - Ứng viên mới ứng tuyển',
                      text: `Xin chào ${fullname}.

Một ứng viên vừa ứng tuyển vào công việc "${name}" mà bạn đã đăng tuyển.
Hãy đăng nhập vào CVFREE để xem chi tiết thông tin. (${Constants.clientURL}/sign-in)

Trân trọng,
CVFREE`
                    };
                    const isSentEmail = sendMailToEmployer(mailOptions)
                    if (isSentEmail) { // thêm vào bảng applymanage
                      ApplyManageModel.findOne({ userId })
                      .then(applyManage => {
                        const dataApply = {
                          jobId: job._doc._id,
                          jobName: job._doc.name,
                          cvId,
                          cvName: cv._doc.name,
                          cvFullname: cv._doc.detail.fullname,
                          status: 'WAITING',
                          createdAt: new Date()
                        }
                        if (!applyManage) {
                          const newApply = new ApplyManageModel({
                            userId,
                            applies: [dataApply]
                          })
                          newApply.save()
                            .then(() => resSuccess(res, null, 'APPLY_JOB_SUCCESS'))
                            .catch(e => resError(res, e.message))
                        }
                        else {
                          const oldApplies = applyManage._doc.applies
                          const newApplies = oldApplies ? [...oldApplies, dataApply] : [dataApply]
                          ApplyManageModel.findOneAndUpdate({ userId }, {
                            applies: newApplies
                          })
                          .then(() => resSuccess(res, null, 'APPLY_JOB_SUCCESS'))
                          .catch(e => resError(res, e.message))
                        }
                      })
                      .catch(e => resError(res, e.message))
                    }
                    else {
                      return resError(res, isSentEmail.error)
                    }
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

module.exports = new JobController();
