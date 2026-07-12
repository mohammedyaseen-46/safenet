const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByPhone } = require('../models/userModel');

async function signup(req, res) {
  try {
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = await findUserByPhone(phone);
    if (existing) {
      return res.status(409).json({ error: 'Phone number already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, phone, passwordHash, role });

    res.status(201).json({ message: 'Account created successfully.', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
}

async function login(req, res) {
  try {
    const { phone, password } = req.body;

    const user = await findUserByPhone(phone);
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
}

module.exports = { signup, login };