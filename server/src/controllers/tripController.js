const { query } = require('../config/db');

async function getTrips(req, res) {
  try {
    const userId = req.user.id;
    const { status, search } = req.query;

    let sql = `
      SELECT t.*,
        COALESCE((SELECT COUNT(*) FROM itinerary_activities a WHERE a.trip_id = t.id), 0) AS activity_count,
        COALESCE((SELECT SUM(amount) FROM expenses e WHERE e.trip_id = t.id), 0) AS total_spent
      FROM trips t
      WHERE t.user_id = $1
    `;
    const params = [userId];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(t.title) LIKE $${params.length} OR LOWER(t.destination) LIKE $${params.length})`;
    }

    sql += ' ORDER BY t.start_date ASC, t.created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, trips: result.rows });
  } catch (err) {
    console.error('Get trips error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching trips.' });
  }
}

async function getTripById(req, res) {
  try {
    const userId = req.user.id;
    const tripId = req.params.id;

    const tripRes = await query(
      'SELECT * FROM trips WHERE id = $1 AND user_id = $2',
      [tripId, userId]
    );

    if (tripRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const trip = tripRes.rows[0];

    // Get itinerary activities ordered by day and time
    const activitiesRes = await query(
      'SELECT * FROM itinerary_activities WHERE trip_id = $1 ORDER BY day_number ASC, time_slot ASC, id ASC',
      [tripId]
    );

    // Get expenses
    const expensesRes = await query(
      'SELECT * FROM expenses WHERE trip_id = $1 ORDER BY expense_date DESC, id DESC',
      [tripId]
    );

    // Calculate budget statistics
    const totalSpent = expensesRes.rows.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const estimatedBudget = parseFloat(trip.estimated_budget || 0);
    const remainingBudget = estimatedBudget - totalSpent;

    res.json({
      success: true,
      trip: {
        ...trip,
        activities: activitiesRes.rows,
        expenses: expensesRes.rows,
        budgetSummary: {
          estimatedBudget,
          totalSpent,
          remainingBudget,
          isOverBudget: remainingBudget < 0,
        }
      }
    });
  } catch (err) {
    console.error('Get trip by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching trip details.' });
  }
}

async function createTrip(req, res) {
  try {
    const userId = req.user.id;
    const {
      title,
      destination,
      start_date,
      end_date,
      description,
      estimated_budget,
      cover_image,
      status
    } = req.body;

    if (!title || !destination || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Title, destination, start date, and end date are required.' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    const defaultImage = cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80';
    const tripStatus = status || 'upcoming';

    const result = await query(
      `INSERT INTO trips (user_id, title, destination, start_date, end_date, description, estimated_budget, cover_image, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        title.trim(),
        destination.trim(),
        start_date,
        end_date,
        description || '',
        parseFloat(estimated_budget) || 0,
        defaultImage,
        tripStatus
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Trip created successfully!',
      trip: result.rows[0]
    });
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ success: false, message: 'Server error creating trip.' });
  }
}

async function updateTrip(req, res) {
  try {
    const userId = req.user.id;
    const tripId = req.params.id;
    const {
      title,
      destination,
      start_date,
      end_date,
      description,
      estimated_budget,
      cover_image,
      status
    } = req.body;

    // Verify trip ownership
    const check = await query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    const result = await query(
      `UPDATE trips
       SET title = COALESCE($1, title),
           destination = COALESCE($2, destination),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           description = COALESCE($5, description),
           estimated_budget = COALESCE($6, estimated_budget),
           cover_image = COALESCE($7, cover_image),
           status = COALESCE($8, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        title ? title.trim() : null,
        destination ? destination.trim() : null,
        start_date || null,
        end_date || null,
        description !== undefined ? description : null,
        estimated_budget !== undefined ? parseFloat(estimated_budget) : null,
        cover_image || null,
        status || null,
        tripId,
        userId
      ]
    );

    res.json({
      success: true,
      message: 'Trip updated successfully!',
      trip: result.rows[0]
    });
  } catch (err) {
    console.error('Update trip error:', err);
    res.status(500).json({ success: false, message: 'Server error updating trip.' });
  }
}

async function deleteTrip(req, res) {
  try {
    const userId = req.user.id;
    const tripId = req.params.id;

    const check = await query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    await query('DELETE FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);

    res.json({
      success: true,
      message: 'Trip and associated itinerary records deleted successfully.'
    });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting trip.' });
  }
}

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
};
