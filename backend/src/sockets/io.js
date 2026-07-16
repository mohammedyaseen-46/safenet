const { Server } = require('socket.io');
 
let ioInstance;
 
function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: { origin: '*' },
  });
  return ioInstance;
}
 
function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return ioInstance;
}
 
module.exports = { initSocket, getIO };
