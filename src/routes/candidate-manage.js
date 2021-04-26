const express = require('express');
const router = express.Router();
const candidateManageController = require('../app/controllers/CandidateManageController');
const authMDW = require('../app/middlewares/check-auth')

router.delete('/delete-candidate', authMDW, candidateManageController.deactive);
router.post('/done-candidate', authMDW, candidateManageController.updateDone);
router.get('/', authMDW, candidateManageController.showList);

module.exports = router;
