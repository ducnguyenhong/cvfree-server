const userRouter = require('./user')
const authRouter = require('./auth')
const mediaRouter = require('./media')
const candidateRouter = require('./candidate')
const locationRouter = require('./location')
const cvRouter = require('./cv')
const employerRouter = require('./employer')
const jobRouter = require('./job')
const companyRouter = require('./company')
const apiVersion = require('../constants/index').apiVersion

const route = (app) => {
  app.use(`/${apiVersion}/users`, userRouter);
  app.use(`/${apiVersion}/employer`, employerRouter);
  app.use(`/${apiVersion}/candidate`, candidateRouter);
  app.use(`/${apiVersion}/cvs`, cvRouter);
  app.use(`/${apiVersion}/locations`, locationRouter);
  app.use(`/${apiVersion}/auth`, authRouter);
  app.use(`/${apiVersion}/media`, mediaRouter);
  app.use(`/${apiVersion}/jobs`, jobRouter);
  app.use(`/${apiVersion}/company`, companyRouter);
};

module.exports = route;
