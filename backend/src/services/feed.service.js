const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../config/db');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

exports.rankFeedWithAI = async (userId, posts) => {
  try {
    if (!posts || posts.length === 0) return [];

    const userResult = await pool.query(
      `SELECT u.*,
       array_agg(DISTINCT h.hashtag) as interests
       FROM users u
       LEFT JOIN (
         SELECT user_id, unnest(hashtags) as hashtag
         FROM posts WHERE user_id = $1
       ) h ON h.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    const user = userResult.rows[0];

    const postSummaries = posts.map(p => ({
      id: p.id,
      content: p.content.substring(0, 200),
      likes: p.likes_count,
      comments: p.comments_count,
      hashtags: p.hashtags,
      age_hours: Math.floor(
        (Date.now() - new Date(p.created_at)) / 3600000
      )
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a feed ranking algorithm. Rank these posts for a user with interests: ${JSON.stringify(user?.interests || [])}.

Posts: ${JSON.stringify(postSummaries)}

Return ONLY a JSON array like:
[{"id": "post-id", "score": 0.95, "reason": "High engagement, matches interests"}]

Score 0-1. Consider: engagement, recency, relevance to user interests. Return ONLY valid JSON, no markdown formatting.`
      }]
    });

    const text = response.content[0].text;
    const ranked = JSON.parse(text.replace(/```json|```/g, '').trim());

    for (const item of ranked) {
      await pool.query(
        `INSERT INTO feed_scores (user_id, post_id, score, reason)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, post_id) DO UPDATE
         SET score = $3, reason = $4`,
        [userId, item.id, item.score, item.reason]
      );
    }

    return ranked;
  } catch (err) {
    console.error('AI ranking error:', err);
    return posts.map(p => ({ id: p.id, score: p.likes_count * 0.1, reason: 'Fallback ranking' }));
  }
};
