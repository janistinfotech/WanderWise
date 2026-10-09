const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/trip/:tripId', budgetController.getTripBudgetSummary);
router.post('/expenses', budgetController.addExpense);
router.put('/expenses/:id', budgetController.updateExpense);
router.delete('/expenses/:id', budgetController.deleteExpense);

module.exports = router;
