const pool = require('../config/db');
 
async function createAlert(victimId, lat, lng) {
  const result = await pool.query(
    `INSERT INTO alerts (victim_id, origin_lat, origin_lng)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [victimId, lat, lng]
  );
  return result.rows[0];
}
async function getActiveAlerts() {
  const result = await pool.query(
    `SELECT * FROM alerts WHERE status = 'active' ORDER BY created_at DESC`
  );
  return result.rows;
}
 
async function getAlertById(id) {
  const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [id]);
  return result.rows[0];
}
 
async function updateAlertStatus(id, status) {
  const result = await pool.query(
    `UPDATE alerts
     SET status = $1,
         resolved_at = CASE WHEN $1 != 'active' THEN NOW() ELSE resolved_at END
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

 
module.exports = { createAlert, getActiveAlerts, getAlertById, updateAlertStatus };
