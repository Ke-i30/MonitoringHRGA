const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const assetRoutes = require('./routes/assetRoutes');
const requisitionRoutes = require('./routes/requisitionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/requisitions', requisitionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'HRGA Request Management API Running' });
});

app.listen(PORT, () => {
  console.log(`HRGA Backend Server listening on http://localhost:${PORT}`);
});
