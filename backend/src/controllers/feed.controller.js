const pool = require('../config/db');
const { rankFeedWithAI } = require('../services/feed.service');

// Get AI-ranked feed
exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*,
       u.name, u.username, u.avatar, u.is_verified,
       EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as is_liked,
       fs.score as ai_score, fs.reason as ai_reason
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN feed_scores fs ON fs.post_id = p.id AND fs.user_id = $1
       WHERE p.user_id = $1
         OR p.user_id IN (
           SELECT following_id FROM follows WHERE follower_id = $1
         )
       ORDER BY COALESCE(fs.score, 0) DESC, p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const posts = result.rows;

    if (posts.length > 0 && page == 1) {
      rankFeedWithAI(userId, posts).catch(console.error);
    }

    res.json({
      posts,
      page: Number(page),
      hasMore: posts.length === Number(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get trending posts
exports.getTrending = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name, u.username, u.avatar, u.is_verified
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.created_at > NOW() - INTERVAL '24 hours'
       ORDER BY (p.likes_count * 2 + p.comments_count * 3) DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get trending hashtags
exports.getTrendingHashtags = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT unnest(hashtags) as tag, COUNT(*) as count
       FROM posts
       WHERE created_at > NOW() - INTERVAL '48 hours'
       GROUP BY tag
       ORDER BY count DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
