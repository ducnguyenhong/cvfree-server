const CvModel = require("../models/CvModel");
const JobModel = require('../models/JobModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')

class CandidateController {
  // [GET] /candidate
  async showListCandidate(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const employerId = req.userRequest.id
  
    CvModel.find().sort({ updatedAt: -1 })
      .then(cvs => {
        const { dataPaging, pagination } = getPagingData(req, cvs)
        let dataRes = []

        for (let i = 0; i < dataPaging.length; i++) {
          const { candidateId, detail, isPrimary, career, updatedAt, _id, unlockedEmployers } = dataPaging[i]
          if (isPrimary) {
            const { fullname, birthday, address, workExperience, gender, applyPosition, avatar } = detail
            dataRes.push({
              avatar,
              career: career ? career.label : '',
              candidateId,
              fullname,
              birthday,
              gender,
              applyPosition,
              address: address ? address.label : '',
              workExperience: !!(workExperience && workExperience.length > 0),
              updatedAt,
              cvId: unlockedEmployers && [...unlockedEmployers].includes(employerId) ? _id : ''
            })
          }
        }
        return resSuccess(res, {items: dataRes, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /candidate/jobId=:jobId/informations=:ids
  async showListCandidateInfos(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const userId = req.userRequest._id.toString()
    const {ids, jobId} = req.params

    const queryCandidateAppliedJob = async () => {
      return JobModel.findOne({ _id: jobId })
        .then(job => {
          const { candidateApplied } = job._doc
          return candidateApplied
        })
        .catch(e => resError(res, e.message))
    }

    const queryCandidate = async () => {
      let dataRes = []
      const candidateApplied = await queryCandidateAppliedJob()

      for (let i = 0; i <= listCandidate.length; i++) {
        let candidateI = null
        if (candidateApplied && candidateApplied.length > 0) {
          for (let j = 0; j < candidateApplied.length; j++){
            if (candidateApplied[j]._doc.cvId === listCandidate[i]) {
              candidateI = candidateApplied[j]
            }
          }
        }
        
        await CvModel.findOne({ _id: listCandidate[i] })
          .then(candidate => {
            if (candidate) {
              const { detail, _id } = candidate._doc
              const { fullname, gender, avatar } = detail
              dataRes.push({
                avatar,
                fullname,
                gender,
                cvId: _id,
                appliedAt: candidateI ? candidateI.appliedAt : null,
                jobId
              })
            }
          })
          .catch(e => resError(res, e.message))
        }
      return dataRes
    }

    const checkJobCreator = async (jobId) => {
      let check = false
      await JobModel.findOne({ _id: jobId })
        .then(job => {
          if (job && job._doc.creatorId === userId) {
            check = true
          }
        })
        .catch(e => resError(res, e.message))
      return check
    }

    let listCandidate = null
    
    if (ids) {
      listCandidate = ids.split(',')
    }
    
    if (!listCandidate || listCandidate.length === 0) {
      return resError(res, 'REQUIRED_LIST_CANDIDATE')
    }

    const checkCreator = await checkJobCreator(jobId)

    if (!checkCreator) {
      return resError(res, 'USER_REQUEST_IS_NOT_JOB_CREATOR')
    }

    const dataRes = await queryCandidate()
    const { dataPaging, pagination } = getPagingData(req, dataRes, true)
    return resSuccess(res, {items: dataPaging, pagination})
  }

  // [GET] /candidate/:id
  async showCandidateDetail(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const candidateId = req.params.id
    const userId = req.userRequest.id
  
    CvModel.findOne({candidateId})
      .then(cv => {
        if (!cv) {
          return resError(res, 'NOT_EXISTS_CANDIDATE')
        }
        const { candidateId, detail, career, updatedAt, unlockedEmployers, _id } = cv._doc
        const { fullname, birthday, address, workExperience, gender, applyPosition, avatar, careerGoals, education, advancedSkill, activity, certificate, award } = detail
        const dataRes = {
          avatar,
          career: career.label,
          candidateId,
          education,
          fullname,
          birthday,
          workExperience,
          activity,
          award,
          advancedSkill,
          gender,
          careerGoals,
          certificate,
          applyPosition,
          address: address.label,
          updatedAt,
          cvId: unlockedEmployers && [...unlockedEmployers].includes(userId) ? _id : ''
        }

        return resSuccess(res, {candidateDetail: dataRes})
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new CandidateController();