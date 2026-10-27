const express = require('express');
const router = express.Router();
const c = require('../controllers/commentController');
const authRequired = require('../middleware/auth');

router.get('/post/:postId', c.listByPost);         // 公开
router.post('/', authRequired, c.create);            // 登录
router.delete('/:id', authRequired, c.remove);       // 登录
router.post('/:id/like', authRequired, c.toggleLike); // 登录

module.exports = router;
