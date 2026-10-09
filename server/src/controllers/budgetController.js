const { query } = require('../config/db');

async function getTripBudgetSummary(req, res) {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const tripRes = await query('SELECT id, title, destination, estimated_budget, start_date, end_date FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const trip = tripRes.rows[0];
    const estimatedBudget = parseFloat(trip.estimated_budget || 0);

    const expensesRes = await query(
      'SELECT * FROM expenses WHERE trip_id = $1 ORDER BY expense_date DESC, id DESC',
      [tripId]
    );

    const expenses = expensesRes.rows;
    const totalSpent = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const remainingBudget = estimatedBudget - totalSpent;
    const percentSpent = estimatedBudget > 0 ? Math.min(100, Math.round((totalSpent / estimatedBudget) * 100)) : 0;

    // Group by category
    const categoriesMap = {
      transportation: 0,
      accommodation: 0,
      food: 0,
      activities: 0,
      other: 0,
    };

    expenses.forEach((item) => {
      const cat = (item.category || 'other').toLowerCase();
      if (categoriesMap[cat] !== undefined) {
        categoriesMap[cat] += parseFloat(item.amount || 0);
      } else {
        categoriesMap.other += parseFloat(item.amount || 0);
      }
    });

    const categoryBreakdown = Object.keys(categoriesMap).map((cat) => ({
      category: cat,
      amount: categoriesMap[cat],
      percentage: totalSpent > 0 ? Math.round((categoriesMap[cat] / totalSpent) * 100) : 0,
    }));

    res.json({
      success: true,
      trip: {
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
      },
      budget: {
        estimatedBudget,
        totalSpent,
        remainingBudget,
        percentSpent,
        isOverBudget: remainingBudget < 0,
        categoryBreakdown,
        expenses
      }
    });
  } catch (err) {
    console.error('Get budget summary error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching budget details.' });
  }
}

async function addExpense(req, res) {
  try {
    const userId = req.user.id;
    const { trip_id, category, amount, expense_date, description, notes } = req.body;

    if (!trip_id || !category || !amount || !expense_date || !description) {
      return res.status(400).json({ success: false, message: 'Trip ID, category, amount, date, and description are required.' });
    }

    // Verify trip ownership
    const trip = await query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [trip_id, userId]);
    if (trip.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const result = await query(
      `INSERT INTO expenses (trip_id, category, amount, expense_date, description, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        trip_id,
        category.toLowerCase(),
        parseFloat(amount),
        expense_date,
        description.trim(),
        notes ? notes.trim() : ''
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully!',
      expense: result.rows[0]
    });
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ success: false, message: 'Server error recording expense.' });
  }
}

async function updateExpense(req, res) {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const { category, amount, expense_date, description, notes } = req.body;

    const check = await query(
      `SELECT e.id FROM expenses e
       JOIN trips t ON e.trip_id = t.id
       WHERE e.id = $1 AND t.user_id = $2`,
      [expenseId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found or unauthorized.' });
    }

    const result = await query(
      `UPDATE expenses
       SET category = COALESCE($1, category),
           amount = COALESCE($2, amount),
           expense_date = COALESCE($3, expense_date),
           description = COALESCE($4, description),
           notes = COALESCE($5, notes)
       WHERE id = $6
       RETURNING *`,
      [
        category ? category.toLowerCase() : null,
        amount !== undefined ? parseFloat(amount) : null,
        expense_date || null,
        description ? description.trim() : null,
        notes !== undefined ? notes : null,
        expenseId
      ]
    );

    res.json({
      success: true,
      message: 'Expense updated successfully!',
      expense: result.rows[0]
    });
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ success: false, message: 'Server error updating expense.' });
  }
}

async function deleteExpense(req, res) {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const check = await query(
      `SELECT e.id FROM expenses e
       JOIN trips t ON e.trip_id = t.id
       WHERE e.id = $1 AND t.user_id = $2`,
      [expenseId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found or unauthorized.' });
    }

    await query('DELETE FROM expenses WHERE id = $1', [expenseId]);

    res.json({
      success: true,
      message: 'Expense deleted successfully.'
    });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting expense.' });
  }
}

module.exports = {
  getTripBudgetSummary,
  addExpense,
  updateExpense,
  deleteExpense,
};
