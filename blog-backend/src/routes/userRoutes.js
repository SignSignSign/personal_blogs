const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const authRequired = require('../middleware/auth');

router.get('/me', authRequired, user.getMe);
router.put('/me', authRequired, user.updateMe);

module.exports = router;
