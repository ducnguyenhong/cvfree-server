const express = require('express');
const router = express.Router();
const jobController = require('../app/controllers/JobController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/newest', jobController.showListNewest);
router.post('/:id/candidate-apply', jobController.candidateApply);
router.get('/:id', jobController.showDetail);
router.get('/', authMDW,  jobController.showList);
router.post('/', authMDW, jobController.create);

module.exports = router;
