const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/trip/:tripId', itineraryController.getActivitiesByTrip);
router.post('/activities', itineraryController.createActivity);
router.put('/activities/:id', itineraryController.updateActivity);
router.delete('/activities/:id', itineraryController.deleteActivity);

module.exports = router;
