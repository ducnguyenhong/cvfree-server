const express = require('express');
const router = express.Router();
const reportJobController = require('../app/controllers/ReportJobController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/', authMDW, reportJobController.showList)
router.post('/', authMDW, reportJobController.reportJob)

module.exports = router;
