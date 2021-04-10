const express = require('express');
const router = express.Router();
const cvController = require('../app/controllers/CvController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/my-cvs/suggest', authMDW, cvController.showMyCvsSuggest);
router.get('/my-cvs', authMDW, cvController.showMyCvs);
router.get('/:id', authMDW, cvController.showDetail);
router.get('/', authMDW, cvController.showList);
router.post('/', authMDW, cvController.create);
router.put('/:id', authMDW, cvController.update);
router.delete('/:id', authMDW, cvController.delete);

module.exports = router;
