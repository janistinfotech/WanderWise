const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, destinationController.getDestinations);
router.get('/favorites', requireAuth, destinationController.getFavorites);
router.post('/:id/favorite', requireAuth, destinationController.toggleFavorite);

module.exports = router;
