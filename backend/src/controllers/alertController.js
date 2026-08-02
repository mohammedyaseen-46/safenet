const { createAlert, getAlertById, updateAlertStatus } = require('../models/alertModel');
const { findNearbyVolunteers } = require('../models/volunteerModel');
const { getIO } = require('../sockets/io');
 
const RADIUS_KM = parseFloat(process.env.ALERT_RADIUS_KM) || 2;
 
async function raiseAlert(req, res) {
  try {
    const { lat, lng } = req.body;
 
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat and lng are required.' });
    }
 
    const alert = await createAlert(req.user.id, lat, lng);
    const nearbyVolunteers = await findNearbyVolunteers(lat, lng, RADIUS_KM);
 
    const io = getIO();
    nearbyVolunteers.forEach((v) => io.to(`user:${v.user_id}`).emit('alert:new', alert));
    io.to('admins').emit('alert:new', { ...alert, matched_volunteer_count: nearbyVolunteers.length });
 
    res.status(201).json({ message: 'Alert created.', alert, matched_volunteers: nearbyVolunteers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating alert.' });
  }
}
 
async function cancelAlert(req, res) {
  try {
    const { alertId } = req.params;
    const alert = await getAlertById(alertId);
 
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }
    if (alert.victim_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only cancel your own alert.' });
    }
    if (alert.status !== 'active') {
      return res.status(400).json({ error: 'Alert is not active.' });
    }
 
    const updated = await updateAlertStatus(alertId, 'cancelled');
 
    const nearbyVolunteers = await findNearbyVolunteers(alert.origin_lat, alert.origin_lng, RADIUS_KM);
    const io = getIO();
    nearbyVolunteers.forEach((v) => io.to(`user:${v.user_id}`).emit('alert:updated', updated));
    io.to('admins').emit('alert:updated', updated);
 
    res.status(200).json({ message: 'Alert cancelled.', alert: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error cancelling alert.' });
  }
}
io.to('admins').emit('alert:new', {
  ...alert,
  matched_volunteers: nearbyVolunteers.map((v) => ({
    user_id: v.user_id,
    name: v.name,
    distance_km: Number(v.distance_km.toFixed(2)),
  })),
});

 
module.exports = { raiseAlert, cancelAlert };
