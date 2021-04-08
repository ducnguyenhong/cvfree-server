const JobModel = require("../models/JobModel");
const jsonRes = require('../helper/json-response')

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

  // // [GET] /cvs/my-cvs
  // async showMyCvs(req, res, next) {
  //   const page = parseInt(req.query.page) || 1
  //   const size = parseInt(req.query.size) || 10
  //   const start = (page - 1) * size
  //   const end = page * size
  //   const userId = req.userRequest._doc.id

  //   CvModel.find({userId, status: 'ACTIVE'}).exec()
  //     .then(cvs => {
  //       let totalPages = 0;
  //       if (cvs.length <= size) {
  //         totalPages = 1
  //       }
  //       if (cvs.length > size) {
  //         totalPages = (cvs.length % size === 0) ? (cvs.length / size) : Math.ceil(cvs.length / size) + 1
  //       }
  //       const dataRes = cvs.slice(start, end).map(item => {
  //         const { password, __v, ...userRes } = item._doc
  //         return userRes
  //       })
  //       return res.status(200).json(jsonRes.success(
  //         200,
  //         {
  //           items: dataRes,
  //           page,
  //           size,
  //           totalItems: cvs.length,
  //           totalPages
  //         },
  //         "GET_DATA_SUCCESS"
  //       ))
  //     })
  //     .catch(e => {
  //     return res.status(400).json(jsonRes.error(400, e.message))
  //   })
  // }

  // // [GET] /cvs/:id
  // async showDetail(req, res, next) {
  //   const cvId = req.params.id
  //   CvModel.findOne({_id: cvId})
  //     .then(cvDetail => {
  //       const { password, __v, ...dataRes } = cvDetail._doc
  //       return res.status(200).json(jsonRes.success(
  //         200,
  //         { cvDetail: dataRes },
  //         "GET_DATA_SUCCESS"
  //       ))
  //     })
  //     .catch(e => {
  //     return res.status(400).json(jsonRes.error(400, e.message))
  //   })
  // }

  // [POST] /jobs
  async create(req, res) {
    const creatorId = req.userRequest._doc.id
    const newJob = new JobModel({...req.body, creatorId})
    newJob.save()
      .then(() => {
        res.status(201).json(jsonRes.success(201, { jobInfo: newJob }, "CREATED_JOB_SUCCESS"))
      })
      .catch((e) => {
        res.status(400).json(jsonRes.error(400, e.message))
      })
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
