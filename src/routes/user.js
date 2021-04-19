const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/UserController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/', authMDW, userController.showList);
router.get('/:id', authMDW, userController.showDetail);

module.exports = router;
