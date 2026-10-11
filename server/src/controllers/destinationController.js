const { query } = require('../config/db');

async function getDestinations(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { search, region } = req.query;

    let sql = 'SELECT d.* FROM destinations d WHERE 1=1';
    const params = [];

    if (region && region !== 'all') {
      params.push(`%${region.trim().toLowerCase()}%`);
      sql += ` AND LOWER(d.region) LIKE $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(d.name) LIKE $${params.length} OR LOWER(d.tags) LIKE $${params.length} OR LOWER(d.description) LIKE $${params.length})`;
    }

    sql += ' ORDER BY d.rating DESC, d.id ASC';

    const result = await query(sql, params);
    let destinations = result.rows;

    // Check favorites if user is authenticated
    if (userId) {
      const favsRes = await query('SELECT destination_id FROM favorite_destinations WHERE user_id = $1', [userId]);
      const favIds = new Set(favsRes.rows.map(r => r.destination_id));
      destinations = destinations.map(d => ({
        ...d,
        is_favorite: favIds.has(d.id)
      }));
    } else {
      destinations = destinations.map(d => ({
        ...d,
        is_favorite: false
      }));
    }

    res.json({ success: true, destinations });
  } catch (err) {
    console.error('Get destinations error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching destinations.' });
  }
}

async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT d.*, true as is_favorite
       FROM destinations d
       JOIN favorite_destinations f ON d.id = f.destination_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({ success: true, favorites: result.rows.map(r => ({ ...r, is_favorite: true })) });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching favorites.' });
  }
}

async function toggleFavorite(req, res) {
  try {
    const userId = req.user.id;
    const destinationId = parseInt(req.params.id, 10);
    if (isNaN(destinationId)) {
      return res.status(400).json({ success: false, message: 'Invalid destination ID.' });
    }

    const destCheck = await query('SELECT id FROM destinations WHERE id = $1', [destinationId]);
    if (destCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    const existing = await query(
      'SELECT id FROM favorite_destinations WHERE user_id = $1 AND destination_id = $2',
      [userId, destinationId]
    );

    if (existing.rows.length > 0) {
      await query('DELETE FROM favorite_destinations WHERE user_id = $1 AND destination_id = $2', [userId, destinationId]);
      return res.json({ success: true, is_favorite: false, message: 'Destination removed from favorites.' });
    } else {
      await query('INSERT INTO favorite_destinations (user_id, destination_id) VALUES ($1, $2)', [userId, destinationId]);
      return res.json({ success: true, is_favorite: true, message: 'Destination saved to favorites!' });
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({ success: false, message: 'Server error toggling favorite.' });
  }
}

module.exports = {
  getDestinations,
  getFavorites,
  toggleFavorite,
};
