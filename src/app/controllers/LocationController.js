const LocationModel = require("../models/LocationModel");
const jsonRes = require('../helper/json-response')

class LocationController {

  // [GET] /locations/cities
  async showListCity(req, res, next) {
    const keyword = req.query.keyword
    LocationModel.find({name: new RegExp(keyword, "i")})
      .then(locations => {
        const dataRes = locations.map(item => {
          return {value: item.id, label: item.name}
        })
        return res.status(200).json(jsonRes.success( 200, { items: dataRes }, "GET_DATA_SUCCESS" ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
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
        return res.status(200).json(jsonRes.success( 200, { items: dataRes }, "GET_DATA_SUCCESS" ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

  // [GET] /locations/cities/:cityId/districts/:districtId
  async showListWards(req, res, next) {
    const cityId = req.params.cityId
    const districtId = req.params.districtId
    const keyword = req.query.keyword
    LocationModel.find({id: cityId ,name: new RegExp(keyword, "i")})
      .then(city => {
        return city[0].districts.map(item => {
          if (item.id === districtId) {
            const dataRes = item.wards.map(item => {
              return {value: item.id, label: item.name}
            })
            return res.status(200).json(jsonRes.success( 200, { items: dataRes }, "GET_DATA_SUCCESS" ))
          }
        })
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }


}

module.exports = new LocationController();
