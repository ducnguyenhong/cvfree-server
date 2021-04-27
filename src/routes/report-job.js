const express = require('express');
const router = express.Router();
const reportJobController = require('../app/controllers/ReportJobController');
const authMDW = require('../app/middlewares/check-auth')

router.post('/', reportJobController.reportJob)

module.exports = router;
