const jsonRes = require('../helper/json-response')
const UserModel = require("../models/UserModel");
const checkExistsData = require('../helper/check-exists-data')
const USER_TYPE = require('../../constants/user-type')
const CONSTANTS = require('../../constants')
const generateToken = require('../helper/generate-token')
const moment = require('moment')

class AuthController {

  // [POST] /auth/sign-in
  async signIn(req, res, next) {
    const username = req.body.username
    const password = req.body.password
    if (await !(checkExistsData(UserModel, 'username', username)) || await !(checkExistsData(UserModel, 'password', password))) {
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

}

module.exports = new AuthController();
