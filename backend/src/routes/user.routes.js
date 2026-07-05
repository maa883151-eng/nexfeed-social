const express = require('express');
const router = express.Router();
const { getProfile, getUserPosts, toggleFollow, updateProfile, searchUsers } = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');

router.get('/search', auth, searchUsers);
router.get('/:username', auth, getProfile);
router.get('/:username/posts', auth, getUserPosts);
router.post('/:id/follow', auth, toggleFollow);
router.put('/profile/update', auth, updateProfile);

module.exports = router;
