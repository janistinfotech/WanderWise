const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', tripController.getTrips);
router.post('/', tripController.createTrip);
router.get('/:id', tripController.getTripById);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;
