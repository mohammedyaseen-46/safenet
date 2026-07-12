const { getPendingProfiles, updateVerificationStatus } = require('../models/volunteerModel');
 
async function listPending(req, res) {
  try {
    const profiles = await getPendingProfiles();
    res.status(200).json({ pending: profiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching pending volunteers.' });
  }
}
 
async function reviewVolunteer(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;
 
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'." });
    }
 
    const updated = await updateVerificationStatus(userId, status);
    if (!updated) {
      return res.status(404).json({ error: 'Volunteer profile not found.' });
    }
 
    res.status(200).json({ message: `Volunteer ${status}.`, profile: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating volunteer status.' });
  }
}
 
module.exports = { listPending, reviewVolunteer };
