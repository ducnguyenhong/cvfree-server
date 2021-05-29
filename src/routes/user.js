const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/UserController');
const authMDW = require('../app/middlewares/check-auth')

router.put('/change-password', authMDW, userController.changePassword);
router.put('/:id', authMDW, userController.update);
router.get('/:id', authMDW, userController.showDetail);
router.get('/', authMDW, userController.showList);

module.exports = router;
