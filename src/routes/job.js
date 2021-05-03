const express = require('express');
const router = express.Router();
const jobController = require('../app/controllers/JobController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/newest', jobController.showListNewest);
router.get('/intern', jobController.showListInterns);
router.get('/high-salary', jobController.showListHighSalary);
router.get('/city/:id', jobController.showListCity);
router.put('/:id', authMDW,  jobController.update);
router.get('/employer/:id', authMDW,  jobController.showListJobOfEmployer);
router.post('/:id/candidate-apply',authMDW, jobController.candidateApply);
router.get('/:id', jobController.showDetail);
router.delete('/:id', authMDW, jobController.delete);
router.get('/', authMDW, jobController.showList);
router.post('/', authMDW, jobController.create);

module.exports = router;
