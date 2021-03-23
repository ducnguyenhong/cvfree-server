const express = require('express');
const multer = require('multer')
const upload = multer({dest: './src/public/uploads/cv/avatar'})
const router = express.Router();
const mediaController = require('../app/controllers/MediaController');
const authMDW = require('../app/helper/middle-ware-auth')

router.post('/upload',authMDW , upload.single('avatar'), mediaController.upload);

module.exports = router;
