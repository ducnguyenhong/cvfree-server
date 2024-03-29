const userRouter = require('./user')
const authRouter = require('./auth')
const mediaRouter = require('./media')
const candidateRouter = require('./candidate')
const candidateManageRouter = require('./candidate-manage')
const applyManageRouter = require('./apply-manage')
const locationRouter = require('./location')
const cvRouter = require('./cv')
const adminRouter = require('./admin')
const employerRouter = require('./employer')
const feedbackRouter = require('./feedback')
const jobRouter = require('./job')
const companyRouter = require('./company')
const requestUpdateCompanyRouter = require('./request-update-company')
const reportJobRouter = require('./report-job')
const sendEmailRouter = require('./send-email')
const dashboardRouter = require('./dashboard')
const apiVersion = require('../constants/index').apiVersion

const route = (app) => {
  app.use(`/${apiVersion}/users`, userRouter)
  app.use(`/${apiVersion}/send-email`, sendEmailRouter)
  app.use(`/${apiVersion}/feedback`, feedbackRouter)
  app.use(`/${apiVersion}/report-job`, reportJobRouter)
  app.use(`/${apiVersion}/employer`, employerRouter)
  app.use(`/${apiVersion}/request-update-company`, requestUpdateCompanyRouter)
  app.use(`/${apiVersion}/candidate-manage`, candidateManageRouter)
  app.use(`/${apiVersion}/apply-manage`, applyManageRouter)
  app.use(`/${apiVersion}/candidate`, candidateRouter)
  app.use(`/${apiVersion}/cvs`, cvRouter)
  app.use(`/${apiVersion}/admin`, adminRouter)
  app.use(`/${apiVersion}/dashboard`, dashboardRouter)
  app.use(`/${apiVersion}/locations`, locationRouter)
  app.use(`/${apiVersion}/auth`, authRouter)
  app.use(`/${apiVersion}/media`, mediaRouter)
  app.use(`/${apiVersion}/jobs`, jobRouter)
  app.use(`/${apiVersion}/companies`, companyRouter)
}

module.exports = route
