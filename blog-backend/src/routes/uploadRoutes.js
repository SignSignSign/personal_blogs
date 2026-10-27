const express = require('express');
const router = express.Router();
const { uploadMw, uploadHandler, uploadError } = require('../controllers/uploadController');
const authRequired = require('../middleware/auth');

// 只有登录用户才能上传
router.post('/', authRequired, uploadMw, uploadHandler, uploadError);

module.exports = router;
