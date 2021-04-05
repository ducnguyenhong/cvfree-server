const express = require('express');
const router = express.Router();
const candidateController = require('../app/controllers/CandidateController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/', authMDW, candidateController.showListCandidate);
router.get('/:id', authMDW, candidateController.showCandidateDetail);

module.exports = router;
