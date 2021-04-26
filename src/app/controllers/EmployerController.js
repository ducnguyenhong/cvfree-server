const CvModel = require("../models/CvModel");
const UserModel = require('../models/UserModel.js')
const JobModel = require('../models/JobModel')
const CandidateManageModel = require('../models/CandidateManageModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const sendEmail = require('../helper/send-email')
const Constants = require('../../constants')
const ApplyManageModel = require('../models/ApplyManageModel')
const getUserInfo = require('../helper/get-user-info')

class EmployerController {

  // [POST] /employer/unlock-candidate
  async unlockCandidate(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const userId = req.userRequest.id
    const candidateId = req.body.id

    UserModel.findOne({ id: userId})
      .then(user => {
        if (!user) {
          return resError(res, 'NOT_EXISTS_EMPLOYER')
        }

        CvModel.findOne({candidateId})
          .then(cv => {
            if (!cv) {
              return resError(res, 'NOT_EXISTS_CANDIDATE')
            }
            const { unlockedEmployers } = cv._doc
            const { numberOfCandidateOpening } = user._doc
            if (numberOfCandidateOpening < 1) {
              return resError(res, 'OPEN_TURN_ENDED')
            }

            CvModel.findOneAndUpdate({candidateId}, {unlockedEmployers: unlockedEmployers ? [...unlockedEmployers, userId] : [userId]})
              .then(() => {
                UserModel.findOneAndUpdate({id: userId}, {numberOfCandidateOpening: numberOfCandidateOpening - 1})
                  .then(() => {
                    // thành công
                    return resSuccess(res, null, 'UNLOCKED_CANDIDATE_SUCCESS')
                })
                .catch(e => resError(res, e.message))
              })
              .catch(e => resError(res, e.message))
          })
          .catch(e => resError(res, e.message))

      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /employer/:id
  async showEmployerDetail(req, res, next) {
    const employerId = req.params.id
    await checkUserTypeRequest(req, res, next, ['ADMIN', 'EMPLOYER'])
  
    UserModel.findOne({id: employerId})
      .then(user => {
        if (!user) {
          return resError(res, 'NOT_EXISTS_EMPLOYER')
        }
        const { numberOfCandidateOpening, numberOfPosting, typeAccount, fullname, birthday, companyId, coin, gender, username, email, address, phone, avatar } = user._doc
        const dataRes = {
          numberOfCandidateOpening,
          numberOfPosting,
          typeAccount,
          companyId,
          fullname,
          birthday,
          coin,
          gender,
          username,
          email,
          address,
          phone,
          avatar
        }

        return resSuccess(res, { employerDetail: dataRes })
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /employer/accept-candidate
  async acceptCandidate(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const employer = req.userRequest
    if (!employer) {
      return resError(res, 'NOT_EXISTS_EMPLOYER')
    }
    const sendMailToUser = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }
    const { jobId, cvId } = req.body
    CvModel.findOne({ _id: cvId })
      .then(cv => {
        if (!cv) {
          return resError(res, 'NOT_EXISTS_CANDIDATE')
        }
        JobModel.findOne({ _id: jobId })
        .then(job => {
          if (!job) {
            return resError(res, 'NOT_EXISTS_JOB')
          }
          const { candidateApplied } = job._doc
          let newCandidateApplied = [...candidateApplied]
          newCandidateApplied = newCandidateApplied.filter(item => item._doc.cvId !== cvId)

          CandidateManageModel.findOne({ employerId: employer._id })
            .then(candidateManage => {
              const {fullname, avatar, gender, phone, email, address} = cv._doc.detail
              const newData = {
                cvId,
                candidate: {candidateId: cv._doc.candidateId, fullname, avatar, gender, phone, email, address},
                jobId,
                jobName: job._doc.name,
                isDone: false,
                createdAt: new Date(),
                status: 'ACTIVE'
              }

              const mailOptions = {
                from: 'cvfreecontact@gmail.com',
                to: cv._doc.detail.email,
                subject: 'CVFREE - Thông báo ứng tuyển việc làm',
                text: `Xin chào ${`${cv._doc.detail.fullname}`.toUpperCase()}.

Nhà tuyển dụng đã chấp nhận hồ sơ của bạn về việc làm "${job._doc.name}" mà bạn đã ứng tuyển.
Nhà tuyển dụng sẽ sớm liên lạc với bạn qua thông tin liên hệ trong CV.
Hãy đăng nhập vào CVFREE để xem chi tiết thông tin. (${Constants.clientURL}/sign-in)

Trân trọng,
CVFREE`
              };

              if (!candidateManage) {
                const newCandidateManage = new CandidateManageModel({
                  employerId: employer._id,
                  candidates: [newData]
                })
                newCandidateManage.save()
                  .then(() => {
                    const resultSendEmailToUser = sendMailToUser(mailOptions)
                    if (resultSendEmailToUser) {
                      JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: newCandidateApplied })
                        .then(() => {
                          ApplyManageModel.findOne({userId: cv._doc.creatorId})
                            .then(applyManage => {
                              let applies = applyManage.applies || []
                              for (let i = 0; i < applies.length; i++){
                                if (applies[i]._doc.cvId === cvId && applies[i]._doc.jobId === jobId) {
                                  applies[i]._doc.status = 'APPROVED'
                                }
                              }

                              ApplyManageModel.findOneAndUpdate({ userId: cv._doc.creatorId }, { applies })
                                .then(() => resSuccess(res, null, 'ACCEPTED_CANDIDATE_SUCCESS'))
                                .catch(e => resError(res, e.message))
                            })
                            .catch(e => resError(res, e.message))
                      })
                      .catch(e => resError(res, e.message))
                    }
                    else {
                      return resError(res, 'ERROR_SEND_EMAIL_TO_USER')
                    }
                  })
                  .catch(e => resError(res, e.message))
              }
              else {
                const { candidates } = candidateManage._doc
                CandidateManageModel.findOneAndUpdate({ employerId: employer._id }, { candidates: [...candidates, newData] })
                  .then(() => {
                    const resultSendEmailToUser = sendMailToUser(mailOptions)
                    if (resultSendEmailToUser) {
                      JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: newCandidateApplied })
                        .then(() => {
                          ApplyManageModel.findOne({userId: cv._doc.creatorId})
                          .then(applyManage => {
                            let applies = applyManage.applies || []
                            for (let i = 0; i < applies.length; i++){
                              if (applies[i]._doc.cvId === cvId && applies[i]._doc.jobId === jobId) {
                                applies[i]._doc.status = 'APPROVED'
                              }
                            }

                            ApplyManageModel.findOneAndUpdate({ userId: cv._doc.creatorId }, { applies })
                              .then(() => resSuccess(res, null, 'ACCEPTED_CANDIDATE_SUCCESS'))
                              .catch(e => resError(res, e.message))
                          })
                          .catch(e => resError(res, e.message))
                      })
                      .catch(e => resError(res, e.message))
                    }
                    else {
                      return resError(res, 'ERROR_SEND_EMAIL_TO_USER')
                    }
                  })
                  .catch(e => resError(res, e.message))
              }
              })
              .catch(e => resError(res, e.message))
        })
        .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /employer/reject-candidate
  async rejectCandidate(req, res, next) {
    const employer = req.userRequest
    if (!employer) {
      return resError(res, 'NOT_EXISTS_EMPLOYER')
    }
    const sendMailToUser = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }
    const { jobId, cvId } = req.body

    CvModel.findOne({_id: cvId})
      .then(cv => {
        if (!cv) {
          return resError(res, 'NOT_EXISTS_CV')
        }

        JobModel.findOne({ _id: jobId })
          .then(job => {
            if (!job) {
              return resError(res, 'NOT_EXISTS_JOB')
            }
            const mailOptions = {
              from: 'cvfreecontact@gmail.com',
              to: cv._doc.detail.email,
              subject: 'CVFREE - Thông báo ứng tuyển việc làm',
              text: `Xin chào ${`${cv._doc.detail.fullname}`.toUpperCase()}.

Nhà tuyển dụng đã từ chối hồ sơ của bạn về việc làm "${job._doc.name}" mà bạn đã ứng tuyển.
Hãy thử tìm công việc phù hợp hơn tại CVFREE. (${Constants.clientURL}/jobs)

Trân trọng,
CVFREE`
            };
            const { candidateApplied } = job._doc
            let newCandidateApplied = [...candidateApplied]
            newCandidateApplied = newCandidateApplied.filter(item => item._doc.cvId !== cvId)

            const resultSendEmailToUser = sendMailToUser(mailOptions)
            if (resultSendEmailToUser) {
              JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: newCandidateApplied })
                .then(() => {
                  ApplyManageModel.findOne({userId: cv._doc.creatorId})
                  .then(applyManage => {
                    let applies = applyManage.applies || []
                    for (let i = 0; i < applies.length; i++){
                      if (applies[i]._doc.cvId === cvId && applies[i]._doc.jobId === jobId) {
                        applies[i]._doc.status = 'DINIED'
                      }
                    }

                    ApplyManageModel.findOneAndUpdate({ userId: cv._doc.creatorId }, { applies })
                      .then(() => resSuccess(res, null, 'REJECTED_CANDIDATE_SUCCESS'))
                      .catch(e => resError(res, e.message))
                  })
                  .catch(e => resError(res, e.message))
              } )
              .catch(e => resError(res, e.message))
            }
            else {
              return resError(res, 'ERROR_SEND_EMAIL_TO_USER')
            }
          })
          .catch(e => resError(res, e.message))
          })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new EmployerController();