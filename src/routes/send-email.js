const express = require('express');
const router = express.Router();
const sendEmailController = require('../app/controllers/SendEmailController');
const authMDW = require('../app/middlewares/check-auth')

router.post('/', authMDW, sendEmailController.sendEmail);

module.exports = router;
