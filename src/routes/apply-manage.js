const express = require('express');
const router = express.Router();
const applyManageController = require('../app/controllers/ApplyManageController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/', authMDW, applyManageController.showListApplyManage);

module.exports = router;
