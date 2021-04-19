const express = require('express');
const multer = require('multer')
const uploadCommon = multer({ dest: './src/public/uploads/common' })
const uploadCompany = multer({ dest: './src/public/uploads/company' })
const uploadCv = multer({dest: './src/public/uploads/cv'})
const router = express.Router();
const mediaController = require('../app/controllers/MediaController');
const authMDW = require('../app/middlewares/check-auth')

router.post('/upload/common', authMDW, uploadCommon.single('image'), mediaController.upload);
router.post('/upload/cv', authMDW, uploadCv.single('image'), mediaController.upload);
router.post('/upload/company',authMDW , uploadCompany.single('image'), mediaController.upload);

module.exports = router;
