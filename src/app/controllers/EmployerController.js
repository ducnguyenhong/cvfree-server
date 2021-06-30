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
const CompanyModel = require("../models/CompanyModel");
const getCvInfo = require('../helper/get-cv-info')
const getUserInfo = require('../helper/get-user-info')

class EmployerController {

  // [POST] /employer/unlock-candidate
  async unlockCandidate(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const employerId = req.userRequest._id
    const candidateId = req.body.id

    UserModel.findOne({ _id: employerId })
      .then(user => {
        if (!user) {
          return resError(res, 'NOT_EXISTS_EMPLOYER')
        }

        CvModel.findOne({ candidateId })
          .then(cv => {
            if (!cv) {
              return resError(res, 'NOT_EXISTS_CANDIDATE')
            }
            const { unlockedEmployers } = cv._doc
            const { numberOfCandidateOpening } = user._doc
            if (numberOfCandidateOpening < 1) {
              return resError(res, 'OPEN_TURN_ENDED')
            }

            CvModel.findOneAndUpdate({ candidateId }, { unlockedEmployers: unlockedEmployers ? [...unlockedEmployers, employerId] : [employerId] })
              .then(() => {
                UserModel.findOneAndUpdate({ _id: employerId }, { numberOfCandidateOpening: numberOfCandidateOpening - 1 })
                  .then(() => {
                    CandidateManageModel.findOne({ employerId })
                      .then(candidateManage => {
                        const { fullname, avatar, gender, phone, email, address } = cv._doc.detail
                        const newData = { 
                          candidate: { fullname, avatar, gender, phone, email, address },
                          applyValue: cv._doc._id.toString(),
                          applyType: 'LOOKING_FOR',
                          isDone: false,
                          createdAt: new Date(),
                          status: 'ACTIVE'
                        }
                        if (!candidateManage) {
                          const newCandidateManage = new CandidateManageModel({
                            employerId,
                            candidates: [newData]
                          })
                          newCandidateManage.save()
                            .then(() => resSuccess(res, null, 'UNLOCKED_CANDIDATE_SUCCESS'))
                            .catch(e => resError(res, e.message))
                        }
                        else {
                          const { candidates } = candidateManage._doc
                          CandidateManageModel.findOneAndUpdate({ employerId }, { candidates: [...candidates, newData] })
                            .then(() => resSuccess(res, null, 'UNLOCKED_CANDIDATE_SUCCESS'))
                            .catch(e => resError(res, e.message))
                        }
                      })
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

  // [GET] /employer/:id
  async showEmployerDetail(req, res, next) {
    const employerId = req.params.id
    await checkUserTypeRequest(req, res, next, ['ADMIN', 'EMPLOYER'])
  
    UserModel.findOne({ id: employerId })
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
    const { jobId, applyValue, userId, applyType } = req.body
    const employer = req.userRequest

    const sendMailToUser = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }

    const candidateInfo = applyType === 'CVFREE' ? await getCvInfo(res, {_id: applyValue}) : await getUserInfo(res, {_id: userId})

    JobModel.findOne({ _id: jobId })
      .then(job => {
        if (!job) {
          return resError(res, 'NOT_EXISTS_JOB')
        }
        const { candidateApplied } = job._doc
        let newCandidateApplied = [...candidateApplied]
        newCandidateApplied = newCandidateApplied.filter(item => item._doc.applyValue !== applyValue)

        CandidateManageModel.findOne({ employerId: employer._id })
          .then(candidateManage => {
            let newData = {}
            let mailOptions = {}

            if (applyType === 'CVFREE') {
              const { detail, _id: cvId } = candidateInfo
              const {fullname, avatar, gender, phone, email, address} = detail
              newData = {
                userId,
                candidate: { fullname, avatar, gender, phone, email, address },
                jobId,
                applyValue,
                applyType,
                jobName: job._doc.name,
                isDone: false,
                createdAt: new Date(),
                status: 'ACTIVE'
              }
              mailOptions = {
                from: 'cvfreecontact@gmail.com',
                to: email,
                subject: 'CVFREE - Thông báo ứng tuyển việc làm',
                text: `Xin chào ${`${fullname}`.toUpperCase()}.

Nhà tuyển dụng đã chấp nhận hồ sơ của bạn về việc làm "${job._doc.name}" mà bạn đã ứng tuyển.
Nhà tuyển dụng sẽ sớm liên lạc với bạn qua thông tin liên hệ trong CV.
Hãy truy cập vào CVFREE để xem chi tiết thông tin. (${Constants.clientURL})

Trân trọng,
CVFREE`
              };
            }
            else { // PDF | OTHER
              const { fullname, avatar, gender, phone, email, address } = candidateInfo
              newData = {
                userId,
                candidate: { fullname, avatar, gender, phone, email, address },
                jobId,
                applyValue,
                applyType,
                jobName: job._doc.name,
                isDone: false,
                createdAt: new Date(),
                status: 'ACTIVE'
              }
              mailOptions = {
                from: 'cvfreecontact@gmail.com',
                to: email,
                subject: 'CVFREE - Thông báo ứng tuyển việc làm',
                text: `Xin chào ${`${fullname || email}`.toUpperCase()}.

Nhà tuyển dụng đã chấp nhận hồ sơ của bạn về việc làm "${job._doc.name}" mà bạn đã ứng tuyển.
Nhà tuyển dụng sẽ sớm liên lạc với bạn qua thông tin liên hệ trong CV.
Hãy truy cập vào CVFREE để xem chi tiết thông tin. (${Constants.clientURL})

Trân trọng,
CVFREE`
              };
            }

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
                        ApplyManageModel.findOne({ userId })
                          .then(applyManage => {
                            let applies = applyManage.applies || []
                            for (let i = 0; i < applies.length; i++) {
                              if (applies[i]._doc.applyValue === applyValue && applies[i]._doc.jobId === jobId) {
                                applies[i]._doc.status = 'APPROVED'
                              }
                            }

                            ApplyManageModel.findOneAndUpdate({ userId }, { applies })
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
                        ApplyManageModel.findOne({ userId })
                          .then(applyManage => {
                            let applies = applyManage.applies || []
                            for (let i = 0; i < applies.length; i++) {
                              if (applies[i]._doc.applyValue === applyValue && applies[i]._doc.jobId === jobId) {
                                applies[i]._doc.status = 'APPROVED'
                              }
                            }

                            ApplyManageModel.findOneAndUpdate({ userId }, { applies })
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
  }

  // [POST] /employer/reject-candidate
  async rejectCandidate(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])

    const sendMailToUser = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }
    const { jobId, applyValue, userId, applyType } = req.body

    const candidateInfo = applyType === 'CVFREE' ? await getCvInfo(res, {_id: applyValue}) : await getUserInfo(res, {_id: userId})

    JobModel.findOne({ _id: jobId })
      .then(job => {
        if (!job) {
          return resError(res, 'NOT_EXISTS_JOB')
        }
        let mailOptions = {}

        if (applyType === 'CVFREE') {
          const { detail } = candidateInfo
          const { fullname, email } = detail
          mailOptions = {
            from: 'cvfreecontact@gmail.com',
            to: email,
            subject: 'CVFREE - Thông báo ứng tuyển việc làm',
            text: `Xin chào ${`${fullname ? fullname.toUpperCase() : email}`}.

Nhà tuyển dụng đã từ chối hồ sơ của bạn về việc làm "${job._doc.name}" mà bạn đã ứng tuyển.
Hãy thử tìm công việc phù hợp hơn tại CVFREE. (${Constants.clientURL}/jobs)

Trân trọng,
CVFREE`};
        }
        else {
          const {email, fullname} = candidateInfo
          mailOptions = {
            from: 'cvfreecontact@gmail.com',
            to: email,
            subject: 'CVFREE - Thông báo ứng tuyển việc làm',
            text: `Xin chào ${`${fullname ? fullname.toUpperCase() : email}`}.

Nhà tuyển dụng đã từ chối hồ sơ của bạn về việc làm "${job._doc.name}" mà bạn đã ứng tuyển.
Hãy thử tìm công việc phù hợp hơn tại CVFREE. (${Constants.clientURL}/jobs)

Trân trọng,
CVFREE`
          };
        }

        const { candidateApplied } = job._doc
        let newCandidateApplied =  candidateApplied.filter(item => item._doc.applyValue !== applyValue)

        const resultSendEmailToUser = sendMailToUser(mailOptions)
        if (resultSendEmailToUser) {
          JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: newCandidateApplied })
            .then(() => {
              ApplyManageModel.findOne({ userId })
                .then(applyManage => {
                  let applies = applyManage.applies || []
                  for (let i = 0; i < applies.length; i++) {
                    if (applies[i]._doc.applyValue === applyValue && applies[i]._doc.jobId === jobId) {
                      applies[i]._doc.status = 'DINIED'
                    }
                  }

                  ApplyManageModel.findOneAndUpdate({ userId }, { applies })
                    .then(() => resSuccess(res, null, 'REJECTED_CANDIDATE_SUCCESS'))
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

  // [POST] /employer/update-company
  async updateCompanyInfo(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const userId = req.userRequest._id
    const { companyId } = req.body
    
    UserModel.findOne({_id: userId})
      .then(user => {
        if (user._doc.companyId) {
          return resError('CAN_NOT_UPDATE_COMPANY_INFO')
        }

        CompanyModel.findOne({_id: companyId})
          .then(company => {
            if (!company) {
              return resError(res, 'NOT_EXISTS_COMPANY')
            }
            UserModel.findOneAndUpdate({_id: userId}, {companyId}, {new: true})
              .then(newUser => {
                const {listStaff} = company._doc
                CompanyModel.findOneAndUpdate({ _id: companyId }, {listStaff: [...listStaff, {id: userId, role: 'MEMBER'}]})
                  .then(() => resSuccess(res, { userDetail: newUser }, 'UPDATED_COMPANY_INFO'))
                  .catch(e => resError(res, e.message))
              })
              .catch(e => resError(res, e.message))
          })
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new EmployerController();