const userRouter = require('./user')
const authRouter = require('./auth')
const mediaRouter = require('./media')
const apiVersion = require('../constants/index').apiVersion

const route = (app) => {
  app.use(`/${apiVersion}/users`, userRouter);
  app.use(`/${apiVersion}/auth`, authRouter);
  app.use(`/${apiVersion}/media`, mediaRouter);
};

module.exports = route;
