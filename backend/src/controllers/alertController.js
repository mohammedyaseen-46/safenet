const { createAlert } = require('../models/alertModel');
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

    nearbyVolunteers.forEach((volunteer) => {
      io.to(`user:${volunteer.user_id}`).emit('alert:new', alert);
    });

    io.to('admins').emit('alert:new', {
      ...alert,
      matched_volunteer_count: nearbyVolunteers.length,
    });

    res.status(201).json({
      message: 'Alert created.',
      alert,
      matched_volunteers: nearbyVolunteers.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating alert.' });
  }
}

module.exports = { raiseAlert };