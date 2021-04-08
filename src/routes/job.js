const express = require('express');
const router = express.Router();
const jobController = require('../app/controllers/JobController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/', authMDW, jobController.showList);
// router.get('/:id', authMDW, userController.showDetail);
router.post('/', authMDW, jobController.create);

module.exports = router;
