const pool = require('../config/db');

async function createUser({ name, phone, passwordHash, role }) {
  const result = await pool.query(
    `INSERT INTO users (name, phone, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, phone, role, created_at`,
    [name, phone, passwordHash, role]
  );
  return result.rows[0];
}

async function findUserByPhone(phone) {
  const result = await pool.query(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  );
  return result.rows[0];
}

module.exports = { createUser, findUserByPhone };
