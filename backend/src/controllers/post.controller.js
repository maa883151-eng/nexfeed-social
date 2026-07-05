const pool = require('../config/db');

// Create post
exports.createPost = async (req, res) => {
  try {
    const { content, image_url } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const hashtags = content.match(/#\w+/g) || [];

    const result = await pool.query(
      `INSERT INTO posts (user_id, content, image_url, hashtags)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, content, image_url, hashtags]
    );

    await pool.query(
      'UPDATE users SET posts_count = posts_count + 1 WHERE id = $1',
      [userId]
    );

    const post = result.rows[0];

    const io = req.app.get('io');
    io.emit('new_post', post);

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*,
       u.name, u.username, u.avatar, u.is_verified,
       EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like / Unlike post
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await pool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, id]
      );
      await pool.query(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1',
        [id]
      );
      res.json({ liked: false });
    } else {
      await pool.query(
        'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
        [userId, id]
      );
      await pool.query(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1',
        [id]
      );
      res.json({ liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comments
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.name, u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const result = await pool.query(
      `INSERT INTO comments (user_id, post_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, id, content]
    );

    await pool.query(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1',
      [id]
    );

    const io = req.app.get('io');
    io.to(`post_${id}`).emit('new_comment', result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [id]
    );

    if (!post.rows[0]) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    await pool.query(
      'UPDATE users SET posts_count = posts_count - 1 WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
