const express = require('express');
const router = express.Router();
const companyController = require('../app/controllers/CompanyController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/employer', authMDW, companyController.showCompanyOfEmployer);
router.get('/suggest', authMDW, companyController.suggest);
router.put('/employer', authMDW, companyController.updateCompanyOfEmployer);
router.delete('/:id/staffs', authMDW, companyController.banStaff);
router.get('/:id/staffs', authMDW, companyController.showListStaff);
router.get('/:id/jobs', companyController.showListJob);
router.get('/:id', companyController.showDetail);
router.get('/', authMDW, companyController.showList);
router.post('/', authMDW, companyController.create);

module.exports = router;
