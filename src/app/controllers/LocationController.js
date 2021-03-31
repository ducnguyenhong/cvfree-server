const LocationModel = require("../models/LocationModel");
const jsonRes = require('../helper/json-response')
class LocationController {

  // [GET] /locations
  async showList(req, res, next) {
    
    LocationModel.find()
      .then(locations => {
        return res.status(200).json(jsonRes.success( 200, { items: locations }, "GET_DATA_SUCCESS" ))
      })
      .catch(e => {
      return res.status(400).json(jsonRes.error(400, e.message))
    })
  }

}

module.exports = new LocationController();
