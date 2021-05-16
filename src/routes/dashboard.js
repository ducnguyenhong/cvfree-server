const express = require('express');
const router = express.Router();
const dashboardController = require('../app/controllers/DashboardController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/users/:id/cvs', authMDW, dashboardController.showListCvOfUser);
router.get('/users/:id/applies', authMDW, dashboardController.showListApplyOfUser);
router.get('/users/:id/candidate-manages', authMDW, dashboardController.showListCandidateOfEmployer);
router.get('/users/:id/jobs', authMDW, dashboardController.showListJobOfEmployer);
router.get('/', authMDW, dashboardController.overview);

module.exports = router;
