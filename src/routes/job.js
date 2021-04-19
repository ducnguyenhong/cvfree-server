const express = require('express');
const router = express.Router();
const jobController = require('../app/controllers/JobController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/newest', jobController.showListNewest);
router.get('/employer/:id', authMDW,  jobController.showListJobOfEmployer);
router.post('/:id/candidate-apply',authMDW, jobController.candidateApply);
router.get('/:id', jobController.showDetail);

router.post('/', authMDW, jobController.create);

module.exports = router;
