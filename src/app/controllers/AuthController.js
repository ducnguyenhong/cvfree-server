const jsonRes = require('../helper/json-response')
const UserModel = require("../models/UserModel");
const checkExistsData = require('../helper/check-exists-data')
const USER_TYPE = require('../../constants/user-type')
const CONSTANTS = require('../../constants')
const generateToken = require('../helper/generate-token')
const moment = require('moment')
const md5 = require('md5')

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cvfreecontact@gmail.com',
    pass: 'protoncf291'
  }
});

class AuthController {

  // [POST] /auth/sign-in
  async signIn(req, res, next) {
    const username = req.body.username
    const password = req.body.password
    if (!(await checkExistsData(UserModel, 'username', username)) || !(await checkExistsData(UserModel, 'password', password))) {
      res.status(400).json(jsonRes.error(409, 'USERNAME_OR_PASSWORD_INCORRECT'))
      return
    }
    const user = await UserModel.findOne({username})
    const accessTokenLife = CONSTANTS.accessTokenLife
    const accessTokenSecret = CONSTANTS.accessTokenSecret

    const dataForAccessToken = {
      username: user.username,
      email: user.email
    };

    const accessToken = await generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife,
    );

    if (!accessToken) {
      res.status(401).json(jsonRes.error(409, 'NETWORK_ERROR'))
      return
    }

    return res.status(200).json(jsonRes.success(
      200,
      {
        userInfo: user,
        auth: {
          token: accessToken,
          expiredAt: moment().add(30, 'days').valueOf()
        }
      },
      "LOGIN_SUCCESS"
    ))
  }

  // [POST] /auth/sign-up
  async signUp(req, res) {
    const username = req.body.username
    const email = req.body.email
    const type = req.body.type

    if (await checkExistsData(UserModel, 'username', username)) {
      res.status(409).json(jsonRes.error(409, 'USERNAME_ALREADY_EXISTS'))
      return
    }
    if (await checkExistsData(UserModel, 'email', email)) {
      res.status(409).json(jsonRes.error(409, 'EMAIL_ALREADY_EXISTS'))
      return
    }
    if (!USER_TYPE.includes(type)) {
      res.status(409).json(jsonRes.error(409, 'USER_TYPE_INVALID'))
      return
    }
    const newUser = new UserModel(req.body)
    newUser.save()
      .then(() => {
        res.status(201).json(jsonRes.success(201, { userInfo: newUser }, "CREATED_ACCOUNT_SUCCESS"))
      })
      .catch((e) => {
        res.status(400).json(jsonRes.error(400, e.message))
      })
  }

  // [POST] /auth/forgot-password
  async forgotPassword(req, res, next) {
    const email = req.body.email
    if (!(await (checkExistsData(UserModel, 'email', email)))) {
      return res.status(400).json(jsonRes.error(409, 'EMAIL_INCORRECT'))
    }
    let newPassword = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i=0; i<6; i++) {
      newPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    UserModel.findOneAndUpdate({ email }, { password: md5(newPassword) })
      .then(() => {
        var mailOptions = {
          from: 'cvfreecontact@gmail.com',
          to: email,
          subject: 'CVFREE - Quên mật khẩu',
          text: newPassword
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            return res.status(400).json(jsonRes.error(400, error))
          } else {
            return res.status(200).json(jsonRes.success(
              200, null, "FORGOT_PASSWORD_SUCCESS"
            ))
          }
        });
        // emailjs.send(configEmailJs.serviceId, configEmailJs.templateForgotPasswordId, dataEmail, configEmailJs.userId).then(
        //   (result) => {
        //     console.log('ducnh email', result)
        //     if (result.status === 200) {
        //       return res.status(200).json(jsonRes.success(
        //         200, null, "FORGOT_PASSWORD_SUCCESS"
        //       ))
        //     }
        //   },
        //   (error) => {
        //     console.log('ducnh7', error);
        //     return res.status(400).json(jsonRes.error(400, error))
        //   }
        // )
      })
      .catch(e => {
        console.log('ducnh8', e);
        return res.status(400).json(jsonRes.error(400, e.message))
      })
  }

}

module.exports = new AuthController();
