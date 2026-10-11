require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb, getDbType } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'WanderWise — Smart Travel Planner and Itinerary Management System',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    database: getDbType(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// In production, serve Vite client build from ../client/dist
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server after DB Init
async function startServer() {
  try {
    await initDb();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 WanderWise Backend API running on port ${PORT}`);
      console.log(`🌐 Health check available at http://localhost:${PORT}/api/health`);
    });
    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
