const express = require('express');
const router = express.Router();
const { createPost, getPost, toggleLike, getComments, addComment, deletePost } = require('../controllers/post.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, createPost);
router.get('/:id', auth, getPost);
router.post('/:id/like', auth, toggleLike);
router.get('/:id/comments', auth, getComments);
router.post('/:id/comments', auth, addComment);
router.delete('/:id', auth, deletePost);

module.exports = router;
