const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
 const { listPending, reviewVolunteer, listActiveAlerts, resolveAlert } = require('../controllers/adminController');
router.get('/volunteers/pending', authMiddleware, requireRole('admin'), listPending);
router.patch('/volunteers/:userId', authMiddleware, requireRole('admin'), reviewVolunteer);
 const { listPending, reviewVolunteer, listActiveAlerts, resolveAlert, listAllVolunteers } = require('../controllers/adminController');
 
router.get('/volunteers', authMiddleware, requireRole('admin'), listAllVolunteers);


 
router.get('/alerts/active', authMiddleware, requireRole('admin'), listActiveAlerts);
router.patch('/alerts/:alertId/resolve', authMiddleware, requireRole('admin'), resolveAlert);

module.exports = router;
