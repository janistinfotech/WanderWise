const { query } = require('../config/db');

async function updateProfile(req, res) {
  try {
    const { name, bio, travel_style, currency, avatar_url } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }

    const result = await query(
      `UPDATE users
       SET name = $1, bio = $2, travel_style = $3, currency = $4, avatar_url = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, email, avatar_url, bio, travel_style, currency, updated_at`,
      [name.trim(), bio || '', travel_style || 'Cultural & Adventure', currency || 'PHP', avatar_url || '', userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
}

module.exports = {
  updateProfile,
};
