const express = require('express');
const router = express.Router();
const dashboardController = require('../app/controllers/DashboardController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/', authMDW, dashboardController.show);

module.exports = router;
