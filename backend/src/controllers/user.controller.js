const pool = require('../config/db');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `SELECT id, name, username, avatar, bio,
       followers_count, following_count, posts_count, is_verified, created_at
       FROM users WHERE username = $1`,
      [username]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    const followCheck = await pool.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [req.user.id, user.id]
    );

    res.json({ ...user, is_following: followCheck.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user posts
exports.getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await pool.query(
      `SELECT p.*, u.name, u.username, u.avatar, u.is_verified,
       EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $3 OFFSET $4`,
      [userResult.rows[0].id, req.user.id, limit, offset]
    );

    res.json({ posts: result.rows, hasMore: result.rows.length === Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Follow / Unfollow
exports.toggleFollow = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (id === followerId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existing = await pool.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, id]
      );
      await pool.query('UPDATE users SET followers_count = followers_count - 1 WHERE id = $1', [id]);
      await pool.query('UPDATE users SET following_count = following_count - 1 WHERE id = $1', [followerId]);
      res.json({ following: false });
    } else {
      await pool.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
        [followerId, id]
      );
      await pool.query('UPDATE users SET followers_count = followers_count + 1 WHERE id = $1', [id]);
      await pool.query('UPDATE users SET following_count = following_count + 1 WHERE id = $1', [followerId]);
      res.json({ following: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE users SET name = $1, bio = $2, avatar = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, username, email, avatar, bio, followers_count, following_count`,
      [name, bio, avatar, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    const result = await pool.query(
      `SELECT id, name, username, avatar, is_verified, followers_count
       FROM users
       WHERE name ILIKE $1 OR username ILIKE $1
       LIMIT 10`,
      [`%${q || ''}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
