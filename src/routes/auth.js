const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');
// const upload = multer({dest: './src/public/uploads/'})

router.post('/sign-in', authController.signIn)
router.post('/sign-up', authController.signUp)
// router.post('/upload',upload.single('avatar'), courseController.upload);
// router.get('/create', courseController.create);
// router.post('/store', courseController.store);
// router.get('/:id/edit', courseController.showEdit);
// router.put('/:id', courseController.update);
// router.get('/:slug', courseController.show);
// router.post('/', authController.login);


module.exports = router;
