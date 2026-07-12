const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { submitProfile, toggleActive } = require('../controllers/volunteerController');
 
router.post('/profile', authMiddleware, upload.single('id_document'), submitProfile);
router.patch('/active', authMiddleware, toggleActive);
 
module.exports = router;
