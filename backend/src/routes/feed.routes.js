const express = require('express');
const router = express.Router();
const { getFeed, getTrending, getTrendingHashtags } = require('../controllers/feed.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, getFeed);
router.get('/trending', auth, getTrending);
router.get('/hashtags/trending', auth, getTrendingHashtags);

module.exports = router;
