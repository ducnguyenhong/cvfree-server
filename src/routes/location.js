const express = require('express');
const router = express.Router();
const locationController = require('../app/controllers/LocationController');
const authMDW = require('../app/helper/middle-ware-auth')

router.get('/', authMDW, locationController.showList);

module.exports = router;
