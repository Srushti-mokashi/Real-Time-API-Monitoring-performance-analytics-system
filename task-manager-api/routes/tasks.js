const express = require('express');
const router = express.Router();
const { getLogs, getAnalytics } = require('../controllers/taskController');

router.get('/', getLogs);
router.get('/analytics', getAnalytics);

module.exports = router;