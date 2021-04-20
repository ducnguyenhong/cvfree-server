const CvModel = require("../models/CvModel");
const UserModel = require('../models/UserModel.js')
const JobModel = require('../models/JobModel')
const CandidateManageModel = require('../models/CandidateManageModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const checkUserTypeRequest = require('../helper/check-user-type-request')

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
          newCandidateApplied = newCandidateApplied.filter(item => item.cvId !== cvId)

          CandidateManageModel.findOne({ employerId: employer._id })
            .then(candidateManage => {
              const newData = {
                cvId,
                candidateId: cv._doc.candidateId,
                candidateFullname: cv._doc.detail.fullname,
                jobId,
                jobName: job._doc.name,
                isDone: false,
                createdAt: new Date()
              }

              if (!candidateManage) {
                const newCandidateManage = new CandidateManageModel({
                  employerId: employer._id,
                  candidates: [newData]
                })
                newCandidateManage.save()
                  .then(() => {
                    JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: newCandidateApplied })
                      .then(() => resSuccess(res, null, 'ACCEPTED_CANDIDATE_SUCCESS'))
                      .catch(e => resError(res, e.message))
                  })
                  .catch(e => resError(res, e.message))
              }
              else {
                const { candidates } = candidateManage._doc
                CandidateManageModel.findOneAndUpdate({ employerId: employer._id }, { candidates: [...candidates, newData] })
                  .then(() => resSuccess(res, null, 'ACCEPTED_CANDIDATE_SUCCESS'))
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
    const { jobId, cvId } = req.body
    JobModel.findOne({ _id: jobId })
      .then(job => {
        if (!job) {
          return resError(res, 'NOT_EXISTS_JOB')
        }
        const { candidateApplied } = job._doc
        let newCandidateApplied = [...candidateApplied]
        newCandidateApplied = newCandidateApplied.filter(item => item.cvId !== cvId)
        JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: newCandidateApplied })
          .then(() => resSuccess(res, null, 'REJECTED_CANDIDATE_SUCCESS'))
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new EmployerController();