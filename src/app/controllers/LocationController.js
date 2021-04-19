const LocationModel = require("../models/LocationModel")
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')

class LocationController {

  // [GET] /locations/cities
  async showListCity(req, res) {
    const keyword = req.query.keyword
    LocationModel.find({name: new RegExp(keyword, "i")})
      .then(locations => {
        const dataRes = locations.map(item => {
          return {value: item.id, label: item.name}
        })
        return resSuccess(res, {items: dataRes})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /locations/cities/:cityId
  async showListDistrict(req, res, next) {
    const cityId = req.params.cityId
    const keyword = req.query.keyword
    LocationModel.find({id: cityId})
      .then(city => {
        let dataRes = []
        if (keyword) {
          dataRes = city[0].districts.map(item => {
            if (`${item.name}`.includes(keyword)) {
              return {value: item.id, label: item.name}
            }
          })
        }
        else {
          dataRes = city[0].districts.map(item => {
            return {value: item.id, label: item.name}
          })
        }
        return resSuccess(res, {items: dataRes})
      })
      .catch(e => resError(res, e.message))
  }

  // [GET] /locations/cities/:cityId/districts/:districtId
  async showListWards(req, res, next) {
    const cityId = req.params.cityId
    const districtId = req.params.districtId
    const keyword = req.query.keyword
    LocationModel.find({id: cityId, name: new RegExp(keyword, "i")})
      .then(city => {
        return city[0].districts.map(item => {
          if (item.id === districtId) {
            const dataRes = item.wards.map(item => {
              return {value: item.id, label: item.name}
            })
            return resSuccess(res, {items: dataRes})
          }
        })
      })
      .catch(e => resError(res, e.message))
  }


}

module.exports = new LocationController();
