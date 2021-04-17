const express = require('express');
const router = express.Router();
const companyController = require('../app/controllers/CompanyController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/:id', companyController.showDetail);
router.get('/:id/jobs', companyController.showListJob);
router.get('/suggest', authMDW, companyController.suggest);
router.get('/', authMDW, companyController.showList);
router.post('/', authMDW, companyController.create);

module.exports = router;
