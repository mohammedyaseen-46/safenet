const { createAlert } = require('../models/alertModel');
const { getIO } = require('../sockets/io');
 
async function raiseAlert(req, res) {
  try {
    const { lat, lng } = req.body;
 
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat and lng are required.' });
    }
 
    const alert = await createAlert(req.user.id, lat, lng);
 
    getIO().emit('alert:new', alert);
 
    res.status(201).json({ message: 'Alert created.', alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating alert.' });
  }
}
 
module.exports = { raiseAlert };
