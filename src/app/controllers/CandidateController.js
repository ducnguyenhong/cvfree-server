const CvModel = require("../models/CvModel");
const JobModel = require('../models/JobModel')
const jsonRes = require('../helper/json-response')

class CandidateController {
  // [GET] /candidate
  async showListCandidate(req, res, next) {
    const page = parseInt(req.query.page) || 1
    const size = parseInt(req.query.size) || 10
    const start = (page - 1) * size
    const end = page * size
    const userId = req.userRequest._doc.id
  
    CvModel.find().sort({ updatedAt: -1 })
      .then(cvs => {
        let totalPages = 0;
        if (cvs.length <= size) {
          totalPages = 1
        }
        if (cvs.length > size) {
          totalPages = (cvs.length % size === 0) ? (cvs.length / size) : Math.ceil(cvs.length / size) + 1
        }
        // const randomCvs = cvs.sort(() => Math.random() - Math.random()).slice(0, 50)
        const cvsSlice = cvs.slice(start, end)
        let dataRes = []
        for (let i = 0; i < cvsSlice.length; i++) {
          const { candidateId, detail, isPrimary, career, updatedAt, _id, unlockedEmployers } = cvsSlice[i]._doc
          if (isPrimary) {
            const { fullname, birthday, address, workExperience, gender, applyPosition, avatar } = detail
            dataRes.push({
              avatar,
              career: career.label,
              candidateId,
              fullname,
              birthday,
              gender,
              applyPosition,
              address: address.label,
              workExperience: !!(workExperience && workExperience.length > 0),
              updatedAt,
              cvId: unlockedEmployers && [...unlockedEmployers].includes(userId) ? _id : ''
            })
          }
        }
        return res.status(200).json(jsonRes.success(
          200,
          {
            items: dataRes,
            page,
            size,
            totalItems: cvs.length,
            totalPages
          },
          "GET_DATA_SUCCESS"
        ))
      })
      .catch(e => {
        return res.status(400).json(jsonRes.error(400, e.message))
      })
  }

  // [GET] /candidate/manage
  async showListCandidateManage(req, res, next) {
    const page = parseInt(req.query.page) || 1
    const size = parseInt(req.query.size) || 10
    const start = (page - 1) * size
    const end = page * size
    const userId = req.userRequest._doc.id
  
    CvModel.find().sort({ updatedAt: -1 })
      .then(cvs => {
        let totalPages = 0;
        if (cvs.length <= size) {
          totalPages = 1
        }
        if (cvs.length > size) {
          totalPages = (cvs.length % size === 0) ? (cvs.length / size) : Math.ceil(cvs.length / size) + 1
        }
        // const randomCvs = cvs.sort(() => Math.random() - Math.random()).slice(0, 50)
        const cvsSlice = cvs.slice(start, end)
        let dataRes = []
        for (let i = 0; i < cvsSlice.length; i++) {
          const { candidateId, detail, isPrimary, career, updatedAt, _id, unlockedEmployers } = cvsSlice[i]._doc
          if (isPrimary) {
            const { fullname, birthday, address, workExperience, gender, applyPosition, avatar } = detail
            dataRes.push({
              avatar,
              career: career.label,
              candidateId,
              fullname,
              birthday,
              gender,
              applyPosition,
              address: address.label,
              workExperience: !!(workExperience && workExperience.length > 0),
              updatedAt,
              cvId: unlockedEmployers && [...unlockedEmployers].includes(userId) ? _id : ''
            })
          }
        }
        return res.status(200).json(jsonRes.success(
          200,
          {
            items: dataRes,
            page,
            size,
            totalItems: cvs.length,
            totalPages
          },
          "GET_DATA_SUCCESS"
        ))
      })
      .catch(e => {
        return res.status(400).json(jsonRes.error(400, e.message))
      })
  }

  // [GET] /candidate/informations
  async showListCandidateInfos(req, res, next) {
    const page = parseInt(req.query.page) || 1
    const size = parseInt(req.query.size) || 10
    const userId = req.userRequest._doc.id

    const queryCandidate = async () => {
      let dataRes = []
      for (let i = 0; i <= listCandidate.length; i++) {
        await CvModel.findOne({ _id: listCandidate[i] })
          .then(candidate => {
            if (candidate) {
              const { detail, _id } = candidate._doc
              const { fullname, gender, avatar } = detail
  
              dataRes.push({
                avatar,
                fullname,
                gender,
                cvId: _id
              })
            }
          })
          .catch(e => {
            return res.status(400).json(jsonRes.error(400, e.message))
          })
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
        .catch(e => {
          return res.status(400).json(jsonRes.error(400, e.message))
        })
      return check
    }

    let listCandidate = null
    const {ids, jobId} = req.params
    if (ids) {
      listCandidate = ids.split(',')
    }
    
    if (!listCandidate || listCandidate.length === 0) {
      return res.status(400).json(jsonRes.error(400, 'REQUIRED_LIST_CANDIDATE'))
    }

    const checkCreator = await checkJobCreator(jobId)

    if (!checkCreator) {
      return res.status(400).json(jsonRes.error(400, 'USER_REQUEST_IS_NOT_JOB_CREATOR'))
    }

    let dataRes = await queryCandidate()
    

    console.log('ducnh7', dataRes);

    return res.status(200).json(jsonRes.success(
      200,
      {
        items: dataRes,
        page,
        size,
        totalItems: dataRes.length,
        totalPages: 1
      },
      "GET_DATA_SUCCESS"
    ))
  }

  // [GET] /candidate/:id
  async showCandidateDetail(req, res, next) {
    const candidateId = req.params.id
    const userId = req.userRequest._doc.id
  
    CvModel.findOne({candidateId})
      .then(cvDetail => {
        if (!cvDetail) {
          return res.status(400).json(jsonRes.error(400, 'NOT_EXISTS_CANDIDATE'))
        }
        const { candidateId, detail, career, updatedAt, unlockedEmployers, _id } = cvDetail._doc
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

        return res.status(200).json(jsonRes.success(
          200,
          { candidateDetail: dataRes },
          "GET_DATA_SUCCESS"
        ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }
}

module.exports = new CandidateController();