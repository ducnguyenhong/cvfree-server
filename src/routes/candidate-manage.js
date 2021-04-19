const express = require('express');
const router = express.Router();
const candidateManageController = require('../app/controllers/CandidateManageController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/', authMDW, candidateManageController.showListCandidateManage);

module.exports = router;
