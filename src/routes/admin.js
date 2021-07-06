const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/AdminController');
const authMDW = require('../app/middlewares/check-auth')

router.put('/cvs/change-status/:id', authMDW, adminController.changeStatusCv);
router.put('/jobs/change-status/:id', authMDW, adminController.changeStatusJob);
router.put('/jobs/:id', authMDW, adminController.updateJob);
router.get('/companies/:id', authMDW, adminController.showCompanyDetail);
router.put('/companies/change-status/:id', authMDW, adminController.changeStatusCompany);
router.put('/companies/:id', authMDW, adminController.updateCompany);
router.get('/users/suggest', authMDW, adminController.suggestUserList);

module.exports = router;
