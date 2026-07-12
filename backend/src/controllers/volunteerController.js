const { createProfile, getProfile, setActiveStatus } = require('../models/volunteerModel');
 
async function submitProfile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ID document file is required.' });
    }
 
    const existing = await getProfile(req.user.id);
    if (existing) {
      return res.status(409).json({ error: 'Volunteer profile already submitted.' });
    }
 
    const idDocumentUrl = `/uploads/${req.file.filename}`;
    const profile = await createProfile(req.user.id, idDocumentUrl);
 
    res.status(201).json({ message: 'Profile submitted, pending review.', profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during profile submission.' });
  }
}
 
async function toggleActive(req, res) {
  try {
    const { is_active } = req.body;
    const profile = await getProfile(req.user.id);
 
    if (!profile) {
      return res.status(404).json({ error: 'No volunteer profile found.' });
    }
    if (profile.verification_status !== 'approved') {
      return res.status(403).json({ error: 'Cannot activate: not yet approved.' });
    }
 
    const updated = await setActiveStatus(req.user.id, !!is_active);
    res.status(200).json({ message: 'Status updated.', profile: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating status.' });
  }
}
 
module.exports = { submitProfile, toggleActive };
