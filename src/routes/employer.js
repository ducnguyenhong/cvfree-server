const express = require('express');
const router = express.Router();
const employerController = require('../app/controllers/EmployerController');
const authMDW = require('../app/helper/middle-ware-auth')

router.post('/unlock-candidate', authMDW, employerController.unlockCandiddate);
router.get('/info', authMDW, employerController.showEmployerInfo);
router.get('/:id', authMDW, employerController.showEmployerDetail);

module.exports = router;
