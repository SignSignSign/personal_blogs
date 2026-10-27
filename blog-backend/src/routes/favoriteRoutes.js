const express = require('express');
const router = express.Router();
const c = require('../controllers/favoriteController');
const authRequired = require('../middleware/auth');

router.post('/:id/toggle', authRequired, c.toggle);
router.get('/me', authRequired, c.myList);

module.exports = router;
