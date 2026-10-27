const express = require('express');
const router = express.Router();
const c = require('../controllers/rssController');

router.get('/', c.rss);

module.exports = router;
