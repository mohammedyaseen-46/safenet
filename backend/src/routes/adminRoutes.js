const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { listPending, reviewVolunteer } = require('../controllers/adminController');
 
router.get('/volunteers/pending', authMiddleware, requireRole('admin'), listPending);
router.patch('/volunteers/:userId', authMiddleware, requireRole('admin'), reviewVolunteer);
 
module.exports = router;
