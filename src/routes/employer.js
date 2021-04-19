const express = require('express');
const router = express.Router();
const employerController = require('../app/controllers/EmployerController');
const authMDW = require('../app/middlewares/check-auth')

router.post('/unlock-candidate', authMDW, employerController.unlockCandiddate);
router.post('/accept-candidate', authMDW, employerController.acceptCandidate);
router.post('/reject-candidate', authMDW, employerController.rejectCandidate);
router.get('/info', authMDW, employerController.showEmployerInfo);
router.get('/:id', authMDW, employerController.showEmployerDetail);

module.exports = router;
