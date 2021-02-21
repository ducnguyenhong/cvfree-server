const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/UserController');



// const upload = multer({dest: './src/public/uploads/'})

// router.post('/upload',upload.single('avatar'), courseController.upload);
// router.get('/create', courseController.create);
// router.post('/store', courseController.store);
// router.get('/:id/edit', courseController.showEdit);
// router.put('/:id', courseController.update);
// router.get('/:slug', courseController.show);
router.post('/sign-up', userController.signUp);


module.exports = router;
