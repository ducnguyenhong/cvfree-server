const express = require('express');
const router = express.Router();
const feedbackController = require('../app/controllers/FeedbackController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/', authMDW, feedbackController.showList);
router.post('/', feedbackController.create);

module.exports = router;
