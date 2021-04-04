const userRouter = require('./user')
const authRouter = require('./auth')
const mediaRouter = require('./media')
const candidateRouter = require('./candidate')
const locationRouter = require('./location')
const cvRouter = require('./cv')
const apiVersion = require('../constants/index').apiVersion

const route = (app) => {
  app.use(`/${apiVersion}/users`, userRouter);
  app.use(`/${apiVersion}/candidate`, candidateRouter);
  app.use(`/${apiVersion}/cvs`, cvRouter);
  app.use(`/${apiVersion}/locations`, locationRouter);
  app.use(`/${apiVersion}/auth`, authRouter);
  app.use(`/${apiVersion}/media`, mediaRouter);
};

module.exports = route;
