const express = require('express');
const router = express.Router();
const c = require('../controllers/likeController');
const authRequired = require('../middleware/auth');

router.post('/:id/toggle', authRequired, c.toggle);

module.exports = router;
