const express = require('express');
const multer = require('multer')
const router = express.Router();
const mediaController = require('../app/controllers/MediaController');
const authMDW = require('../app/middlewares/check-auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./src/public/uploads/${req.params.folder}`)
  },
  filename: (req, file, cb) => {
    cb(null, req.params.id + `.${req.params.format}`)
  }
})

const uploadImage = multer({storage})

router.post('/upload/:folder/:id/:format', authMDW , uploadImage.single('image'), mediaController.upload);

module.exports = router;
