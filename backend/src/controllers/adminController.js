const { getPendingProfiles, updateVerificationStatus } = require('../models/volunteerModel');
const { getActiveAlerts, getAlertById, updateAlertStatus } = require('../models/alertModel');
const { findNearbyVolunteers } = require('../models/volunteerModel');
const { getIO } = require('../sockets/io');
 
const RADIUS_KM = parseFloat(process.env.ALERT_RADIUS_KM) || 2;
 
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
 
async function listActiveAlerts(req, res) {
  try {
    const alerts = await getActiveAlerts();
    res.status(200).json({ alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching active alerts.' });
  }
}
 
async function resolveAlert(req, res) {
  try {
    const { alertId } = req.params;
    const alert = await getAlertById(alertId);
 
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }
    if (alert.status !== 'active') {
      return res.status(400).json({ error: 'Alert is not active.' });
    }
 
    const updated = await updateAlertStatus(alertId, 'resolved');
 
    const nearbyVolunteers = await findNearbyVolunteers(alert.origin_lat, alert.origin_lng, RADIUS_KM);
    const io = getIO();
    nearbyVolunteers.forEach((v) => io.to(`user:${v.user_id}`).emit('alert:updated', updated));
    io.to('admins').emit('alert:updated', updated);
 
    res.status(200).json({ message: 'Alert resolved.', alert: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error resolving alert.' });
  }
  const { getAllVolunteers } = require('../models/volunteerModel'); // add to existing import line
 
async function listAllVolunteers(req, res) {
  try {
    const volunteers = await getAllVolunteers();
    res.status(200).json({ volunteers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching volunteers.' });
  }
}
 
// Update your existing module.exports to include listAllVolunteers:
module.exports = { listPending, reviewVolunteer, listActiveAlerts, resolveAlert, listAllVolunteers };

}
 

