const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
 const { listPending, reviewVolunteer, listActiveAlerts, resolveAlert } = require('../controllers/adminController');
router.get('/volunteers/pending', authMiddleware, requireRole('admin'), listPending);
router.patch('/volunteers/:userId', authMiddleware, requireRole('admin'), reviewVolunteer);
 

 
router.get('/alerts/active', authMiddleware, requireRole('admin'), listActiveAlerts);
router.patch('/alerts/:alertId/resolve', authMiddleware, requireRole('admin'), resolveAlert);

module.exports = router;
