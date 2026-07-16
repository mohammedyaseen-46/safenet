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
 
module.exports = { createAlert };
