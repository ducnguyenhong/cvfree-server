const UserModel = require("../models/UserModel");
const checkExistsData = require('../helper/check-exists-data')
const USER_TYPE = require('../../constants/user-type')
const CONSTANTS = require('../../constants')
const generateToken = require('../helper/generate-token')
const moment = require('moment')
const md5 = require('md5')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const sendEmail = require('../helper/send-email')
const AuthModel = require('../models/AuthModel')
class AuthController {

  // [POST] /auth/sign-in
  async signIn(req, res) {
    const {username, password, deviceId} = req.body
    if (!(await checkExistsData(UserModel, 'username', username)) || !(await checkExistsData(UserModel, 'password', password))) {
      return resError(res, 'USERNAME_OR_PASSWORD_INCORRECT', 409)
    }

    const user = await UserModel.findOne({ username })
    if (user && user._doc.status === 'INACTIVE') {
      return resError(res, 'ACCOUNT_HAS_BEEN_LOCKED')
    }
    if (user && !user._doc.verify) {
      return resError(res, 'ACCOUNT_NOT_VERIFY')
    }

    const accessTokenLife = CONSTANTS.accessTokenLife
    const accessTokenSecret = CONSTANTS.accessTokenSecret
    const dataForAccessToken = {
      username: user._doc.username,
      email: user._doc.email
    };
    let accessToken = await generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife,
    );

    AuthModel.findOne({ userId: user._doc._id.toString() })
      .then(authUser => {
        if (!authUser) {
          const newAuthUser = new AuthModel({
            userId: user._doc._id.toString(),
            token: accessToken,
            expiredAt: moment().add(7, 'days').valueOf(),
            deviceId
          })

          newAuthUser.save()
            .then(() => resSuccess(res,
              {
                userInfo: user,
                auth: {
                  token: accessToken,
                  expiredAt: moment().add(7, 'days').valueOf()
                }
              },
              'LOGIN_SUCCESS'
            ))
            .catch(e => resError(res, e.message))
        }
        else {
          if (authUser._doc.deviceId === deviceId) {
            accessToken = authUser._doc.token
          }
          AuthModel.findOneAndUpdate({ userId: user._doc._id.toString() }, {
            token: accessToken,
            expiredAt: moment().add(7, 'days').valueOf()
          })
          .then(() => resSuccess(res,
            {
              userInfo: user,
              auth: {
                token: accessToken,
                expiredAt: moment().add(7, 'days').valueOf()
              }
            },
            'LOGIN_SUCCESS'
          ))
          .catch(e => resError(res, e.message))
        }
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /auth/sign-up
  async signUp(req, res) {
    const {username, email, type} = req.body

    const sendMailToUser = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }

    if (await checkExistsData(UserModel, 'username', username)) {
      return resError(res, 'USERNAME_ALREADY_EXISTS', 409)
    }
    if (await checkExistsData(UserModel, 'email', email)) {
      return resError(res, 'EMAIL_ALREADY_EXISTS', 409)
    }
    if (!USER_TYPE.includes(type)) {
      return resError(res, 'USER_TYPE_INVALID', 409)
    }

    let bonusData = {
      numberOfReportJob: 1,
      status: 'ACTIVE'
    }
    if (type === 'USER') {
      bonusData.numberOfCreateCv = 3
    }
    if (type === 'EMPLOYER') {
      bonusData.numberOfCandidateOpening = 3
      bonusData.numberOfPosting = 3
      bonusData.numberOfRequestUpdateCompany = 1
    }

    const newUser = new UserModel({...req.body, ...bonusData})
    newUser.save()
      .then(() => {
        const verifyURL = `http://localhost:1112/verify-account/${Buffer.from(`${newUser._id}`).toString('base64')}`
        const  mailOptions = {
          from: 'cvfreecontact@gmail.com',
          to: email,
          subject: 'CVFREE - Xác thực tài khoản',
          text: `Xin chào ${username}.
Bạn vừa đăng ký một tài khoản mới tại CVFREE.
Hãy nhấp vào liên kết sau để xác thực tài khoản của mình:
${verifyURL}

Trân trọng,
CVFREE`
        };

        const resultSendEmailToUser = sendMailToUser(mailOptions)

        if (resultSendEmailToUser) {
          return resSuccess(res, { userInfo: newUser }, 'CREATED_ACCOUNT_SUCCESS', 201)
        }
        else {
          return resError(res, 'SEND_EMAIL_ERROR')
        }
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /auth/forgot-password
  async forgotPassword(req, res) {
    const { email } = req.body
    
    const sendMailToUser = async (mailOptions) => {
      return await sendEmail(mailOptions).result
    }

    if (!(await (checkExistsData(UserModel, 'email', email)))) {
      return resError(res, 'NOT_EXISTS_EMAIL', 409)
    }
    let newPassword = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i=0; i<6; i++) {
      newPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    UserModel.findOneAndUpdate({ email }, { password: md5(newPassword) })
      .then(() => {
        const mailOptions = {
          from: 'cvfreecontact@gmail.com',
          to: email,
          subject: 'CVFREE - Quên mật khẩu',
          text: `Xin chào ${email}. Bạn vừa sử dụng chức năng quên mật khẩu tại CVFREE. Mật khẩu mới của bạn là: ${newPassword}

Trân trọng,
CVFREE`
        };

        const resultSendEmailToUser = sendMailToUser(mailOptions)

        if (resultSendEmailToUser) {
          return resSuccess(res, null, 'FORGOT_PASSWORD_SUCCESS')
        }
        else {
          return resError(res, 'SEND_EMAIL_ERROR')
        }
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /auth/verify/:id
  async verify(req, res) {
    const userId = req.body.userId || ''
    const regexASCII = /^[a-zA-Z0-9]+$/

    if (!regexASCII.test(userId) || !(await checkExistsData(UserModel, '_id', userId))) {
      return resError(res, 'USER_NOT_EXISTS', 409)
    }

    UserModel.findOne({ _id: userId })
      .then(user => {
        if (user._doc.verify) {
          return resSuccess(res, null, 'VERIFY_SUCCESS')
        }
        else {
          UserModel.findOneAndUpdate({ _id: userId }, { verify: true })
            .then(() => resSuccess(res, null, 'VERIFY_SUCCESS'))
            .catch(e => resError(res, e.message))
        }
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new AuthController();
