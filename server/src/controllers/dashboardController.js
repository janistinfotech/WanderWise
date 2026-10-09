const { query } = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;

    // Trips summary
    const tripsRes = await query(
      `SELECT id, title, destination, start_date, end_date, estimated_budget, cover_image, status, created_at
       FROM trips
       WHERE user_id = $1
       ORDER BY start_date ASC`,
      [userId]
    );

    const trips = tripsRes.rows;
    const totalTrips = trips.length;
    const upcomingTrips = trips.filter(t => t.status === 'upcoming').length;
    const ongoingTrips = trips.filter(t => t.status === 'ongoing').length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;

    const totalEstimatedBudget = trips.reduce((sum, t) => sum + parseFloat(t.estimated_budget || 0), 0);

    // Total expenses across all user trips
    const expensesRes = await query(
      `SELECT e.amount, e.category FROM expenses e
       JOIN trips t ON e.trip_id = t.id
       WHERE t.user_id = $1`,
      [userId]
    );

    const totalSpent = expensesRes.rows.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalRemainingBudget = totalEstimatedBudget - totalSpent;

    // Upcoming itinerary activities for user
    const activitiesRes = await query(
      `SELECT a.*, t.title as trip_title, t.destination as trip_destination
       FROM itinerary_activities a
       JOIN trips t ON a.trip_id = t.id
       WHERE t.user_id = $1 AND (t.status = 'upcoming' OR t.status = 'ongoing')
       ORDER BY a.day_number ASC, a.time_slot ASC, a.id ASC
       LIMIT 6`,
      [userId]
    );

    // Favorite destinations count
    const favRes = await query(
      'SELECT COUNT(*) as count FROM favorite_destinations WHERE user_id = $1',
      [userId]
    );
    const favoriteCount = parseInt(favRes.rows[0].count, 10);

    // Recent travel plans
    const recentTrips = [...trips].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);

    res.json({
      success: true,
      stats: {
        totalTrips,
        upcomingTrips,
        ongoingTrips,
        completedTrips,
        totalEstimatedBudget,
        totalSpent,
        totalRemainingBudget,
        favoriteCount,
        upcomingActivities: activitiesRes.rows,
        recentTrips,
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard statistics.' });
  }
}

module.exports = {
  getDashboardStats,
};
