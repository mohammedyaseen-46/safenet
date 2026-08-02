const { setLocation } = require('../models/volunteerModel');
 
const onlineVolunteers = new Map();
 
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.user.id} (${socket.user.role})`);
 
    socket.join(`user:${socket.user.id}`);
 
    if (socket.user.role === 'admin') {
      socket.join('admins');
      socket.emit('volunteers:online', Array.from(onlineVolunteers.keys()));
    }
 
    if (socket.user.role === 'volunteer') {
      onlineVolunteers.set(socket.user.id, true);
      io.to('admins').emit('volunteers:online', Array.from(onlineVolunteers.keys()));
    }
 
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
      if (socket.user.role === 'volunteer') {
        onlineVolunteers.delete(socket.user.id);
        io.to('admins').emit('volunteers:online', Array.from(onlineVolunteers.keys()));
      }
    });
  });
}
 
module.exports = registerSocketHandlers;
