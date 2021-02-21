const express = require('express');
const router = express.Router();
const loginController = require('../app/controllers/LoginController');
// const upload = multer({dest: './src/public/uploads/'})

// router.post('/upload',upload.single('avatar'), courseController.upload);
// router.get('/create', courseController.create);
// router.post('/store', courseController.store);
// router.get('/:id/edit', courseController.showEdit);
// router.put('/:id', courseController.update);
// router.get('/:slug', courseController.show);
router.get('/', loginController.login);


module.exports = router;
