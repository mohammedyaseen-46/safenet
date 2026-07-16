require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const pool = require('./config/db');
 
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const alertRoutes = require('./routes/alertRoutes');
 
const { initSocket } = require('./sockets/io');
const socketAuthMiddleware = require('./sockets/socketAuth');
const registerSocketHandlers = require('./sockets/handlers');
 
const app = express();
app.use(cors());
app.use(express.json());
 
app.get('/health', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json({ status: 'ok', db_time: result.rows[0].now });
});
 
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/auth', authRoutes);
app.use('/volunteers', volunteerRoutes);
app.use('/admin', adminRoutes);
app.use('/alerts', alertRoutes);
 
const server = http.createServer(app);
const io = initSocket(server);
io.use(socketAuthMiddleware);
registerSocketHandlers(io);
 
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
