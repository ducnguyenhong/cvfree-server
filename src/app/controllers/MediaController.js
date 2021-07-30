const Constants = require('../../constants')
const resSuccess = require('../response/response-success')

class MediaController {

  // [POST] /media/upload
  async upload(req, res) {
    const staticURL = `${req.file.path}`.slice(10, req.file.path.length)
    return resSuccess(res, {url: `${Constants.serverURL}${staticURL}`}, 'UPLOAD_SUCCESS')
  }
}

module.exports = new MediaController();
