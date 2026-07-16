const jwt = require('jsonwebtoken');
 
function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
 
  if (!token) {
    return next(new Error('No token provided.'));
  }
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid or expired token.'));
  }
}
 
module.exports = socketAuthMiddleware;
async function setLocation(userId, lat, lng) {
  const result = await pool.query(
    `UPDATE volunteer_profiles
     SET last_lat = $1, last_lng = $2, last_seen = NOW()
     WHERE user_id = $3
     RETURNING user_id, last_lat, last_lng, last_seen`,
    [lat, lng, userId]
  );
  return result.rows[0];
}
 
// Remember to add setLocation to the module.exports object at the bottom of the file
