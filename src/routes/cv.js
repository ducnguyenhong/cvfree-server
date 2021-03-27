const express = require('express');
const router = express.Router();
const cvController = require('../app/controllers/CvController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/', authMDW, cvController.showList);
router.get('/:id', authMDW, cvController.showDetail);
router.post('/', authMDW, cvController.create);
router.put('/:id', authMDW, cvController.update);

module.exports = router;
