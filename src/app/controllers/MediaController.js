const jsonRes = require('../helper/json-response')
const CONSTANTS = require('../../constants')

class UserController {

  // [POST] /media/upload
  async upload(req, res, next) {
    const staticURL = `${req.file.path}`.slice(10, req.file.path.length)
    res.status(200).json(jsonRes.success(200, {
      url: `${CONSTANTS.serverURL}${staticURL}`
    }, 'UPLOAD_SUCCESS'))
  }
}

module.exports = new UserController();
