const express = require('express');
const router = express.Router();
const companyController = require('../app/controllers/CompanyController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/detail', authMDW, companyController.showDetail);
router.get('/', authMDW, companyController.showList);
router.get('/suggest', authMDW, companyController.suggest);
router.post('/', authMDW, companyController.create);

module.exports = router;
