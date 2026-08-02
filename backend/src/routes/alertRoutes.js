const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { raiseAlert } = require('../controllers/alertController');
 
const { raiseAlert, cancelAlert } = require('../controllers/alertController');
 
router.patch('/:alertId/cancel', authMiddleware, cancelAlert);

router.post('/', authMiddleware, raiseAlert);
 
module.exports = router;
