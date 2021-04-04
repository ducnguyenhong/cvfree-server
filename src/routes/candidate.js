const express = require('express');
const router = express.Router();
const cvController = require('../app/controllers/CvController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/', authMDW, cvController.showListCandidate);
router.get('/:id', authMDW, cvController.showDetail);

module.exports = router;
