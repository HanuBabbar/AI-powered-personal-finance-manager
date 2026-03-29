const express = require('express');
const router = express.Router();
const { getAIAdvice } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// Protect the AI endpoint
router.post('/', protect, getAIAdvice);

module.exports = router;
