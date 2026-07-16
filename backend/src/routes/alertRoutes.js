const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { raiseAlert } = require('../controllers/alertController');
 
router.post('/', authMiddleware, raiseAlert);
 
module.exports = router;
