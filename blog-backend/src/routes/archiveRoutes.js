const express = require('express');
const router = express.Router();
const c = require('../controllers/archiveController');

router.get('/', c.index);
router.get('/:year', c.byYearMonth);
router.get('/:year/:month', c.byYearMonth);

module.exports = router;
