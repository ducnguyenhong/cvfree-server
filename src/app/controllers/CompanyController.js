const CompanyModel = require("../models/CompanyModel");
const jsonRes = require('../helper/json-response')
const UserModel = require('../models/UserModel')

class CompanyController {

  // [GET] /company
  async showList(req, res, next) {
    const page = parseInt(req.query.page) || 1
    const size = parseInt(req.query.size) || 10
    const start = (page - 1) * size
    const end = page * size
    
    CompanyModel.find()
      .then(companies => {
        let totalPages = 0;
        if (companies.length <= size) {
          totalPages = 1
        }
        if (companies.length > size) {
          totalPages = (companies.length % size === 0) ? (companies.length / size) : Math.ceil(companies.length / size) + 1
        }
        const dataRes = companies.slice(start, end).map(item => {
          const { ...companyRes } = item._doc
          return companyRes
        })
        return res.status(200).json(jsonRes.success(
          200,
          {
            items: dataRes,
            page,
            size,
            totalItems: companies.length,
            totalPages
          },
          "GET_DATA_SUCCESS"
        ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

  // [GET] /company/suggest
  async suggest(req, res, next) {
    const page = parseInt(req.query.page) || 1
    const size = parseInt(req.query.size) || 10
    const start = (page - 1) * size
    const end = page * size
    const keyword = req.query.keyword
    
    CompanyModel.find()
      .then(companies => {
        let totalPages = 0;
        if (companies.length <= size) {
          totalPages = 1
        }
        if (companies.length > size) {
          totalPages = (companies.length % size === 0) ? (companies.length / size) : Math.ceil(companies.length / size) + 1
        }
        const companySlice = companies.slice(start, end).map(item => {
          const { ...companyRes } = item._doc
          return companyRes
        })
        let dataRes = []
        if (keyword) {
          dataRes = companySlice.map(item => {
            if (`${item.name}`.includes(keyword)) {
              return {value: item.id, label: item.name}
            }
          })
        }
        else {
          dataRes = companySlice.map(item => {
            return {value: item.id, label: item.name}
          })
        }
        return res.status(200).json(jsonRes.success(
          200,
          {
            items: dataRes,
            page,
            size,
            totalItems: companies.length,
            totalPages
          },
          "GET_DATA_SUCCESS"
        ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

  // [POST] /company
  async create(req, res) {
    const creatorId = req.userRequest._doc.id
    const newCompany = new CompanyModel({...req.body, creatorId})
    newCompany.save()
      .then((company) => {
        const companyId = company._doc.id
        UserModel.findOneAndUpdate({ id: creatorId }, { companyId })
          .then(() => {
            res.status(201).json(jsonRes.success(201, { companyInfo: newCompany }, "CREATED_COMPANY_SUCCESS"))
          })
          .catch((e) => {
            res.status(400).json(jsonRes.error(400, e.message))
          })
      })
      .catch((e) => {
        res.status(400).json(jsonRes.error(400, e.message))
      })
  }

  // [GET] /company/detail
  async showDetail(req, res, next) {
    const companyId = req.userRequest._doc.companyId
    CompanyModel.findOne({id: companyId})
      .then(companyDetail => {
        if (!companyDetail) {
          return res.status(200).json(jsonRes.success(
            200,
            { companyDetail: null },
            "NOT_EXISTS_COMPANY"))
        }

        const { ...dataRes } = companyDetail._doc
        return res.status(200).json(jsonRes.success(
          200,
          { companyDetail: dataRes },
          "GET_DATA_SUCCESS"
        ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

}

module.exports = new CompanyController();
