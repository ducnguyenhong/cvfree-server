const checkUserTypeRequest = require('../helper/check-user-type-request')
const Constants = require('../../constants')
const sendEmail = require('../helper/send-email')
const resSuccess = require('../response/response-success')

class SendEmailController {

  // [POST] /send-email
  async sendEmail(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['ADMIN'])

    const sendMailToEmployer = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }

    const { emailTo, content, title } = req.body
    

    const mailOptions = {
      from: 'cvfreecontact@gmail.com',
      to: emailTo,
      subject: `${title}`,
      text: content
    }

    const isSentEmail = sendMailToEmployer(mailOptions)
    if (isSentEmail) {
      return resSuccess(res, null, 'SENT_EMAIL_SUCCESS')
    }
    else {
      return resError(res, 'SEND_EMAIL_FAIL')
    }
  }
}

module.exports = new SendEmailController();