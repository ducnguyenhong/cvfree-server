const CandidateManageModel = require('../models/CandidateManageModel')
const jsonRes = require('../helper/json-response')

class CandidateController {
  // [GET] /candidate-manage
  async showListCandidateManage(req, res, next) {
    const page = parseInt(req.query.page) || 1
    const size = parseInt(req.query.size) || 10
    const start = (page - 1) * size
    const end = page * size
    const userId = req.userRequest._doc._id
  
    CandidateManageModel.findOne({employerId: userId})
      .then(candidateManage => {
        if (!candidateManage) {
          return res.status(200).json(jsonRes.success(
            200,
            {
              items: [],
              page,
              size,
              totalItems: data.length,
              totalPages
            },
            "GET_DATA_SUCCESS"
          ))
        }
        const data = candidateManage.candidates || []
        let totalPages = 0;
        if (data.length <= size) {
          totalPages = 1
        }
        if (data.length > size) {
          totalPages = (data.length % size === 0) ? (data.length / size) : Math.ceil(data.length / size) + 1
        }
        const dataRes = data.slice(start, end)
        
        return res.status(200).json(jsonRes.success(
          200,
          {
            items: dataRes,
            page,
            size,
            totalItems: data.length,
            totalPages
          },
          "GET_DATA_SUCCESS"
        ))
      })
      .catch(e => {
        return res.status(400).json(jsonRes.error(400, e.message))
      })
  }
}

module.exports = new CandidateController();