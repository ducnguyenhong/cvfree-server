const express = require('express');
const router = express.Router();
const requestUpdateCompanyController = require('../app/controllers/RequestUpdateCompanyController');
const authMDW = require('../app/middlewares/check-auth')

router.put('/update-process/:id', authMDW, requestUpdateCompanyController.updateProcessStatus);
router.get('/', authMDW, requestUpdateCompanyController.showList);

module.exports = router;
