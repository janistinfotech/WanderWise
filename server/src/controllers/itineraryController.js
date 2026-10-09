const { query } = require('../config/db');

async function getActivitiesByTrip(req, res) {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    // Check trip ownership
    const trip = await query('SELECT id, title, start_date, end_date FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (trip.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const activities = await query(
      'SELECT * FROM itinerary_activities WHERE trip_id = $1 ORDER BY day_number ASC, time_slot ASC, id ASC',
      [tripId]
    );

    res.json({
      success: true,
      trip: trip.rows[0],
      activities: activities.rows
    });
  } catch (err) {
    console.error('Get activities error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching itinerary activities.' });
  }
}

async function createActivity(req, res) {
  try {
    const userId = req.user.id;
    const {
      trip_id,
      day_number,
      activity_date,
      time_slot,
      title,
      location,
      notes,
      estimated_cost,
      category
    } = req.body;

    if (!trip_id || !title) {
      return res.status(400).json({ success: false, message: 'Trip ID and activity title are required.' });
    }

    // Verify trip belongs to user
    const trip = await query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [trip_id, userId]);
    if (trip.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const result = await query(
      `INSERT INTO itinerary_activities (trip_id, day_number, activity_date, time_slot, title, location, notes, estimated_cost, category, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        trip_id,
        parseInt(day_number, 10) || 1,
        activity_date || null,
        time_slot || '09:00 AM',
        title.trim(),
        location ? location.trim() : '',
        notes ? notes.trim() : '',
        parseFloat(estimated_cost) || 0,
        category || 'sightseeing',
        0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Itinerary activity added successfully!',
      activity: result.rows[0]
    });
  } catch (err) {
    console.error('Create activity error:', err);
    res.status(500).json({ success: false, message: 'Server error creating activity.' });
  }
}

async function updateActivity(req, res) {
  try {
    const userId = req.user.id;
    const activityId = req.params.id;
    const {
      day_number,
      activity_date,
      time_slot,
      title,
      location,
      notes,
      estimated_cost,
      category,
      is_completed
    } = req.body;

    // Verify activity ownership via trip
    const check = await query(
      `SELECT a.id FROM itinerary_activities a
       JOIN trips t ON a.trip_id = t.id
       WHERE a.id = $1 AND t.user_id = $2`,
      [activityId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found or unauthorized.' });
    }

    const result = await query(
      `UPDATE itinerary_activities
       SET day_number = COALESCE($1, day_number),
           activity_date = COALESCE($2, activity_date),
           time_slot = COALESCE($3, time_slot),
           title = COALESCE($4, title),
           location = COALESCE($5, location),
           notes = COALESCE($6, notes),
           estimated_cost = COALESCE($7, estimated_cost),
           category = COALESCE($8, category),
           is_completed = COALESCE($9, is_completed)
       WHERE id = $10
       RETURNING *`,
      [
        day_number !== undefined ? parseInt(day_number, 10) : null,
        activity_date || null,
        time_slot || null,
        title ? title.trim() : null,
        location !== undefined ? location : null,
        notes !== undefined ? notes : null,
        estimated_cost !== undefined ? parseFloat(estimated_cost) : null,
        category || null,
        is_completed !== undefined ? (is_completed ? 1 : 0) : null,
        activityId
      ]
    );

    res.json({
      success: true,
      message: 'Activity updated successfully!',
      activity: result.rows[0]
    });
  } catch (err) {
    console.error('Update activity error:', err);
    res.status(500).json({ success: false, message: 'Server error updating activity.' });
  }
}

async function deleteActivity(req, res) {
  try {
    const userId = req.user.id;
    const activityId = req.params.id;

    const check = await query(
      `SELECT a.id FROM itinerary_activities a
       JOIN trips t ON a.trip_id = t.id
       WHERE a.id = $1 AND t.user_id = $2`,
      [activityId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found or unauthorized.' });
    }

    await query('DELETE FROM itinerary_activities WHERE id = $1', [activityId]);

    res.json({
      success: true,
      message: 'Activity removed from itinerary.'
    });
  } catch (err) {
    console.error('Delete activity error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting activity.' });
  }
}

module.exports = {
  getActivitiesByTrip,
  createActivity,
  updateActivity,
  deleteActivity,
};
