const express = require('express');
const router = express.Router();
const c = require('../controllers/draftController');
const authRequired = require('../middleware/auth');

router.get('/mine', authRequired, c.listMine);
router.post('/save', authRequired, c.saveDraft);
router.post('/:id/publish', authRequired, c.publish);

module.exports = router;
