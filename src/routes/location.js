const express = require('express');
const router = express.Router();
const locationController = require('../app/controllers/LocationController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/cities/:cityId/districts/:districtId', authMDW, locationController.showListWards);
router.get('/cities/:cityId', authMDW, locationController.showListDistrict);
router.get('/cities', authMDW, locationController.showListCity);

module.exports = router;
