const express = require('express');
const router = express.Router();
const post = require('../controllers/postController');
const authRequired = require('../middleware/auth');

router.get('/', post.list);
router.get('/:id', post.detail);
router.post('/', authRequired, post.create);
router.put('/:id', authRequired, post.update);
router.delete('/:id', authRequired, post.remove);

module.exports = router;
