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
            newCandidateApplied.push(candidateApplied[i])
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
    const objQuery = {status: 'ACTIVE', isPublic: 'PUBLIC'}

    if (req.query.params) {
      for (const [key, value] of Object.entries(req.query.params)) {
        if (key && value && key !== 'page' && key !== 'size') {
          if (key === 'keyword') {
            objQuery.fullname = new RegExp(value, "i")
          }
          else {
            objQuery[`${key}`] = value
          }
        }
      }
    }

    JobModel.find(objQuery).sort({ createdAt: -1 })
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

  // [GET] /jobs/interns
  async showListInterns(req, res) {
    const cursor = JobModel.find({ status: 'ACTIVE', isPublic: 'PUBLIC' }).cursor();
    let internJobs = []
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      if ([...doc._doc.recruitmentPosition].includes('INTERNS')) {
        internJobs.push(doc)
      }
    }
    const { dataPaging, pagination } = getPagingData(req, internJobs)
    const dataRes = dataPaging.map(item => {
      const { creatorId, candidateApplied, ...jobsRes } = item
      return jobsRes
    })
    return resSuccess(res, {items: dataRes, pagination})
  }

  // [GET] /jobs/high-salary
  async showListHighSalary(req, res) {
    const cursor = JobModel.find({ status: 'ACTIVE', isPublic: 'PUBLIC' }).cursor();
    let jobs = []
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const { salaryType, salaryFrom } = doc._doc.salary
      if (salaryType === 'FROM_TO' && Number(`${salaryFrom}`.replace(/\./g, '')) >= 15000000) {
        jobs.push(doc)
      }
    }
    const { dataPaging, pagination } = getPagingData(req, jobs)
    const dataRes = dataPaging.map(item => {
      const { creatorId, candidateApplied, ...jobsRes } = item
      return jobsRes
    })
    return resSuccess(res, {items: dataRes, pagination})
  }

  // [GET] /jobs/city/:id
  async showListCity(req, res) {
    const cityId = req.params.id
    const cursor = JobModel.find({ status: 'ACTIVE', isPublic: 'PUBLIC' }).cursor();
    let jobs = []
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const {address} = doc._doc
      if (address.value.city === cityId) {
        jobs.push(doc)
      }
    }
    const { dataPaging, pagination } = getPagingData(req, jobs)
    const dataRes = dataPaging.map(item => {
      const { creatorId, candidateApplied, ...jobsRes } = item
      return jobsRes
    })
    return resSuccess(res, {items: dataRes, pagination})
  }

  // [GET] /jobs/career/:id
  async showListCareer(req, res) {
    const careerId = req.params.id
    const cursor = JobModel.find({ status: 'ACTIVE', isPublic: 'PUBLIC' }).cursor();
    let jobs = []
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const {career} = doc._doc
      if ([...career].includes(careerId)) {
        jobs.push(doc)
      }
    }
    const { dataPaging, pagination } = getPagingData(req, jobs)
    const dataRes = dataPaging.map(item => {
      const { creatorId, candidateApplied, ...jobsRes } = item
      return jobsRes
    })
    return resSuccess(res, {items: dataRes, pagination})
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
          companyId,
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
                id: company._id,
                name: company.name,
                logo: company.logo
              }
            }
            if (user && user._doc.type === 'USER') {
              let isApplied = false // nếu có token, check xem user đã applu job đó hay chưa
              const userId = user._doc._id
              if (userId && candidateApplied && candidateApplied.length > 0) {
                for (let i = 0; i < candidateApplied.length; i++){
                  if (candidateApplied[i].userId === userId.toString()) {
                    isApplied = true
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
    const { applyType, applyValue} = req.body
    const { type, _id: userId, fullname: userFullname, gender: userGender, avatar: userAvatar } = req.userRequest
    
    if (type !== 'USER') {
      return resError(res, 'UNAUTHORIZED', 401)
    }

    const sendMailToEmployer = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }

    // tìm job => tìm cv => update job filed candidateApplied => tìm ng tạo job => gửi email => thêm vào bảng applymanage

    JobModel.findOne({_id: jobId})
      .then(job => {
        if (!job) {
          return resError(res, 'NOT_EXISTS_JOB')
        }
        const { candidateApplied, creatorId, name } = job._doc
        JobModel.findOneAndUpdate({ _id: jobId },
          {
            candidateApplied: [...candidateApplied, {
              candidate: {
                fullname: userFullname,
                avatar: userAvatar,
                gender: userGender
              },
              userId, applyType, applyValue, appliedAt: new Date()
            }]
          })
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
Hãy truy cập vào CVFREE để xem chi tiết thông tin. (${Constants.clientURL})

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
                          applyType,
                          applyValue,
                          applyCandidate: {
                            userId,
                            fullname: userFullname ,
                          },
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
  }

}

module.exports = new JobController();
