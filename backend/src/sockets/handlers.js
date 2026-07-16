const { setLocation } = require('../models/volunteerModel');
 
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.user.id} (${socket.user.role})`);
 
    socket.on('location:update', async ({ lat, lng }) => {
      try {
        if (socket.user.role !== 'volunteer') return;
        await setLocation(socket.user.id, lat, lng);
      } catch (err) {
        console.error('location:update error:', err);
      }
    });
 
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${socket.user.id}`);
    });
  });
}
 
module.exports = registerSocketHandlers;
