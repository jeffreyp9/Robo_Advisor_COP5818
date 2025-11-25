// Jeffrey Potvin, Krishana Thapa, Alexey Akopov
// Final Project
// COP 5818
// PIDs: 5066496, 5663249, 5013953

const express = require('express');
const router = express.Router();
const { calculatePortfolio, getUserProfile } = require('../controllers/advisorController');

// POST /api/advisor Calculate portfolio allocation
router.post('/advisor', calculatePortfolio);

// GET /api/advisor/:email Retrieve user profile by email
router.get('/advisor/:email', getUserProfile);

module.exports = router;