const CvModel = require("../models/CvModel");
const jsonRes = require('../helper/json-response')
const UserModel = require('../models/UserModel.js')
const JobModel = require('../models/JobModel')
const CandidateManageModel = require('../models/CandidateManageModel')

class EmployerController {

  // [GET] /employer/info
  async showEmployerInfo(req, res, next) {
    const employer = req.userRequest._doc
    if (!employer) {
      return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_EMPLOYER'))
    }
    const { numberOfCandidateOpening, numberOfPosting, typeAccount, fullname, birthday, companyId, coin, gender, username, email, address, phone, avatar } = employer

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

    return res.status(200).json(jsonRes.success( 200, { employerDetail: dataRes }, "GET_DATA_SUCCESS" ))
  }

  // [POST] /employer/unlock-candidate
  async unlockCandiddate(req, res, next) {
    const userId = req.userRequest._doc.id
    const candidateId = req.body.id

    UserModel.findOne({ id: userId})
      .then(userDetail => {
        if (!userDetail) {
          return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_EMPLOYER'))
        }

        CvModel.findOne({candidateId})
          .then(cvDetail => {
            if (!cvDetail) {
              return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_CANDIDATE'))
            }
            const { unlockedEmployers } = cvDetail._doc
            const { numberOfCandidateOpening } = userDetail._doc
            if (numberOfCandidateOpening < 1) {
              return res.status(400).json(jsonRes.error(400, 'OPEN_TURN_ENDED'))
            }

            CvModel.findOneAndUpdate({candidateId}, {unlockedEmployers: unlockedEmployers ? [...unlockedEmployers, userId] : [userId]})
              .then(() => {
                UserModel.findOneAndUpdate({id: userId}, {numberOfCandidateOpening: numberOfCandidateOpening - 1})
                  .then(() => {
                  // thành công
                  return res.status(200).json(jsonRes.success( 200, null, "UNLOCKED_CANDIDATE_SUCCESS"))
                })
                .catch(e => {
                  return res.status(400).json(jsonRes.error(400, e.message))
                })
              })
              .catch(e => {
                return res.status(400).json(jsonRes.error(400, e.message))
              })
          })
          .catch(e => {
          return res.status(400).json(jsonRes.error(400, e.message))
        })

      })
      .catch(e => {
        return res.status(400).json(jsonRes.error(400, e.message))
      })
  }

  // [GET] /employer/:id
  async showEmployerDetail(req, res, next) {
    const employerId = req.params.id
  
    UserModel.findOne({id: employerId})
      .then(userDetail => {
        if (!userDetail) {
          return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_EMPLOYER'))
        }
        const { numberOfCandidateOpening, numberOfPosting, typeAccount, fullname, birthday, companyId, coin, gender, username, email, address, phone, avatar } = userDetail._doc
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

        return res.status(200).json(jsonRes.success( 200, { employerDetail: dataRes }, "GET_DATA_SUCCESS" ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

  // [POST] /employer/accept-candidate
  async acceptCandidate(req, res, next) {
    const employer = req.userRequest._doc
    if (!employer) {
      return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_EMPLOYER'))
    }
    const { jobId, cvId } = req.body
    CvModel.findOne({ _id: cvId })
      .then(cv => {
        if (!cv) {
          return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_CANDIDATE'))
        }
        JobModel.findOne({ _id: jobId })
        .then(job => {
          if (!job) {
            return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_JOB'))
          }
          const { candidateApplied } = job._doc
          let newCandidateApplied = [...candidateApplied]
          newCandidateApplied = newCandidateApplied.filter(item => item.cvId !== cvId)
          CandidateManageModel.findOne({ employerId: employer._id })
            .then(candidateManage => {
              const newData = {
                cvId,
                candidateFullname: cv._doc.detail.fullname,
                jobId,
                jobName: job._doc.name,
                isDone: false
              }

              if (!candidateManage) {
                const newCandidateManage = new CandidateManageModel({
                  employerId: employer._id,
                  candidates: [newData]
                })
                newCandidateManage.save()
                  .then(() => {
                    JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: newCandidateApplied })
                      .then(() => res.status(200).json(jsonRes.success( 200, undefined, "ACCEPT_CANDIDATE_SUCCESS" )))
                      .catch(e => res.status(400).json(jsonRes.error(400, e.message)))
                  })
                  .catch(e => res.status(400).json(jsonRes.error(400, e.message)))
              }
              else {
                const { candidates } = candidateManage._doc
                CandidateManageModel.findOneAndUpdate({ employerId: employer._id }, { candidates: [...candidates, newData] })
              }
              })
            .catch(e => res.status(400).json(jsonRes.error(400, e.message)))
          
        })
        .catch(e => res.status(400).json(jsonRes.error(400, e.message)))
      })
      .catch(e => res.status(400).json(jsonRes.error(400, e.message)))
  }

  // [POST] /employer/reject-candidate
  async rejectCandidate(req, res, next) {
    const employer = req.userRequest._doc
    if (!employer) {
      return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_EMPLOYER'))
    }
    const { jobId, cvId } = req.body
    JobModel.findOne({ _id: jobId })
      .then(job => {
        if (!job) {
          return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_JOB'))
        }
        const { candidateApplied } = job._doc
        let newCandidateApplied = [...candidateApplied]
        newCandidateApplied = newCandidateApplied.filter(item => item.cvId !== cvId)
        JobModel.findOneAndUpdate({ _id: jobId }, { candidateApplied: newCandidateApplied })
          .then(() => res.status(200).json(jsonRes.success( 200, undefined, "REJECT_CANDIDATE_SUCCESS" )))
          .catch(e => res.status(400).json(jsonRes.error(400, e.message)))
      })
      .catch(e => res.status(400).json(jsonRes.error(400, e.message)))
  }
}

module.exports = new EmployerController();