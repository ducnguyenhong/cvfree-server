const userRouter = require('./user')
const loginRouter = require('./login')
const apiVersion = require('../constants/index').apiVersion

const route = (app) => {
  app.use(`/${apiVersion}/users`, userRouter);
  app.use(`/${apiVersion}/login`, loginRouter);
};

module.exports = route;
