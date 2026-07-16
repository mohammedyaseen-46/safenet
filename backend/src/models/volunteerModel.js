const pool = require('../config/db');

async function createProfile(userId, idDocumentUrl) {
  const result = await pool.query(
    `INSERT INTO volunteer_profiles (user_id, id_document_url)
     VALUES ($1, $2)
     RETURNING user_id, verification_status, is_active`,
    [userId, idDocumentUrl]
  );
  return result.rows[0];
}

async function getPendingProfiles() {
  const result = await pool.query(
    `SELECT vp.user_id, u.name, u.phone, vp.id_document_url, vp.verification_status
     FROM volunteer_profiles vp
     JOIN users u ON u.id = vp.user_id
     WHERE vp.verification_status = 'pending'`
  );
  return result.rows;
}

async function updateVerificationStatus(userId, status) {
  const result = await pool.query(
    `UPDATE volunteer_profiles SET verification_status = $1
     WHERE user_id = $2
     RETURNING user_id, verification_status`,
    [status, userId]
  );
  return result.rows[0];
}

async function getProfile(userId) {
  const result = await pool.query(
    'SELECT * FROM volunteer_profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
}

async function setActiveStatus(userId, isActive) {
  const result = await pool.query(
    `UPDATE volunteer_profiles SET is_active = $1, last_seen = NOW()
     WHERE user_id = $2
     RETURNING user_id, is_active`,
    [isActive, userId]
  );
  return result.rows[0];
}

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

module.exports = {
  createProfile,
  getPendingProfiles,
  updateVerificationStatus,
  getProfile,
  setActiveStatus,
  setLocation,
};