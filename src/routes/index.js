const userRouter = require('./user')
const authRouter = require('./auth')
const apiVersion = require('../constants/index').apiVersion

const route = (app) => {
  app.use(`/${apiVersion}/users`, userRouter);
  app.use(`/${apiVersion}/auth`, authRouter);
};

module.exports = route;
