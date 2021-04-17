const JobModel = require("../models/JobModel");
const ApplyManageModel = require('../models/ApplyManageModel')
const jsonRes = require('../helper/json-response')
const CompanyModel = require('../models/CompanyModel')
const getUserRequest = require('../helper/get-user-request')
const UserModel = require('../models/UserModel')
const sendEmail = require('../helper/send-email')
const CONSTANTS = require('../../constants')
const CvModel = require('../models/CvModel')

class JobController {

  // [GET] /jobs
  async showList(req, res, next) {
    const creatorId = req.userRequest._doc.id 
    const page = parseInt(req.query.page) || 1
    const size = parseInt(req.query.size) || 10
    const start = (page - 1) * size
    const end = page * size
    
    JobModel.find({creatorId, status: 'ACTIVE'})
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
          let newCandidateApplied = [...candidateApplied]
          newCandidateApplied = newCandidateApplied.filter(item => item.accept === false)
          return {...jobsRes, candidateApplied: newCandidateApplied}
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

  // [GET] /jobs
  async showListNewest(req, res, next) {
    const page = parseInt(req.query.page) || 1
    const size = parseInt(req.query.size) || 10
    const start = (page - 1) * size
    const end = page * size
    
    JobModel.find({status: 'ACTIVE'}).sort({ updatedAt: -1 })
      .then(jobs => {
        let totalPages = 0;
        if (jobs.length <= size) {
          totalPages = 1
        }
        if (jobs.length > size) {
          totalPages = (jobs.length % size === 0) ? (jobs.length / size) : Math.ceil(jobs.length / size) + 1
        }
        const dataRes = jobs.slice(start, end).map(item => {
          const { ...jobsRes } = item._doc
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

  // [POST] /jobs
  async create(req, res) {
    const {companyId} = req.userRequest._doc
    const creatorId = req.userRequest._doc.id
    const newJob = new JobModel({...req.body, creatorId, companyId})
    newJob.save()
      .then(() => {
        res.status(201).json(jsonRes.success(201, { jobInfo: newJob }, "CREATED_JOB_SUCCESS"))
      })
      .catch((e) => {
        res.status(400).json(jsonRes.error(400, e.message))
      })
  }

  async showDetail(req, res, next) {
    const bearerToken = req.headers.authorization;
    const jobId = req.params.id
    let user = null
    if (bearerToken) {
      user = await getUserRequest(bearerToken)
    }

    JobModel.findOne({_id: jobId})
      .then(jobDetail => {
        if (!jobDetail) {
          return res.status(200).json(jsonRes.success(
            200,
            { jobDetail: null },
            "NOT_EXISTS_JOB"
          ))
        }
        const { candidateApplied, companyId, ...dataRes } = jobDetail._doc

        CompanyModel.findOne({ _id: companyId })
          .then(companyDetail => {
            if (user) {
              let isApplied = false
              const listCV = user._doc.listCV
              if (listCV && listCV.length > 0 && candidateApplied && candidateApplied.length > 0) {
                for (let i = 0; i < candidateApplied.length; i++){
                  for (let j = 0; j < listCV.length; j++){
                    if (candidateApplied[i] === listCV[j]) {
                      isApplied = true
                    }
                  }
                }
              }
              return res.status(200).json(jsonRes.success(
                200,
                { jobDetail: {...dataRes, isApplied, companyName: companyDetail.name, companyLogo: companyDetail.logo} },
                "GET_DATA_SUCCESS"
              ))
            }
            else {
              return res.status(200).json(jsonRes.success(
                200,
                { jobDetail: {...dataRes, companyName: companyDetail.name, companyLogo: companyDetail.logo} },
                "GET_DATA_SUCCESS"
              ))
            }
          })
          .catch(e => {
            return res.status(400).json(jsonRes.error(400, e.message))
          })
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

  async candidateApply(req, res, next) {
    const jobId = req.params.id
    const cvId = req.body.cvId
    const userId = req.userRequest._doc._id
    
    const sendMailToEmployer = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }

    JobModel.findOne({_id: jobId})
      .then(jobDetail => {
        if (!jobDetail) {
          return res.status(200).json(jsonRes.success(
            200,
            { jobDetail: null },
            "NOT_EXISTS_JOB"
          ))
        }

        CvModel.findOne({ _id: cvId })
          .then(cv => {
            if (!cv) {
              return res.status(200).json(jsonRes.error(
                400,
                null,
                "NOT_EXISTS_CV"
              ))
            }
            const { candidateApplied, creatorId, name } = jobDetail._doc

            JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: [...candidateApplied, {cvId, accept: false}] })
              .then(() => {
                UserModel.findOne({ id: creatorId })
                  .then(creator => {
                    const { email, fullname } = creator._doc
                    const  mailOptions = {
                      from: 'cvfreecontact@gmail.com',
                      to: email,
                      subject: 'CVFREE - Ứng viên mới ứng tuyển',
                      text: `Xin chào ${fullname},
            
                        Một ứng viên vừa ứng tuyển vào công việc "${name}" mà bạn đã đăng.
                        Hãy đăng nhập vào CVFREE để xem chi tiết thông tin.
                        ${CONSTANTS.clientURL}/sign-in
            
                        Trân trọng,
                        CVFREE
                      `
                    };
                    const isSentEmail = sendMailToEmployer(mailOptions)
                    if (isSentEmail) {
                      ApplyManageModel.findOne({ userId })
                      .then(applyManage => {
                        const dataApply = {
                          jobId: jobDetail._doc._id,
                          jobName: jobDetail._doc.name,
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
                            .then(() => {
                              return res.status(200).json(jsonRes.success( 200, undefined, "APPLY_JOB_SUCCESS" ))
                            })
                            .catch(e => res.status(400).json(jsonRes.error(400, e.message))) 
                        }
                        else {
                          const oldApplies = applyManage._doc.applies
                          const newApplies = oldApplies ? [...oldApplies, dataApply] : [dataApply]
                          ApplyManageModel.findOneAndUpdate({ userId }, {
                            applies: newApplies
                          })
                            .then(() => {
                              return res.status(200).json(jsonRes.success( 200, undefined, "APPLY_JOB_SUCCESS" ))
                            })
                            .catch(e => res.status(400).json(jsonRes.error(400, e.message)))
                        }
                      })
                      .catch(e => res.status(400).json(jsonRes.error(400, e.message)))
                    }
                    else {
                      return res.status(400).json(jsonRes.error(400, isSentEmail.error))
                    }
                  })
                  .catch(e => res.status(400).json(jsonRes.error(400, e.message))) 
              })
              .catch(e => res.status(400).json(jsonRes.error(400, e.message))) 
              })
          .catch(e => res.status(400).json(jsonRes.error(400, e.message))) 
      })
      .catch(e => res.status(400).json(jsonRes.error(400, e.message))) 
  }

  // // [PUT] /cvs
  // async update(req, res) {
  //   const cvId = req.params.id
  //   CvModel.findByIdAndUpdate(cvId, req.body)
  //     .then(() => {
  //       res.status(200).json(jsonRes.success(200, { cvInfo: req.body }, "UPDATED_CV_SUCCESS"))
  //     })
  //     .catch(e => {
  //     return res.status(400).json(jsonRes.error(400, e.message))
  //   })
    
  // }

  // // [DELETE] /cvs/:id
  // async delete(req, res) {
  //   const cvId = req.params.id
  //   CvModel.findOneAndUpdate(cvId, {status: 'INACTIVE'})
  //     .then(() => {
  //       res.status(200).json(jsonRes.success(200, null, "DELETED_CV_SUCCESS"))
  //     })
  //     .catch(e => {
  //     return res.status(400).json(jsonRes.error(400, e.message))
  //   })
    
  // }

}

module.exports = new JobController();
