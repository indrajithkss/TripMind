/**
 * Server Entry Point
 * Express server setup and configuration
 */

const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { connectDB } = require('./database/connection');

const app = express();

// Connect to MongoDB
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API endpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`  POST http://localhost:${PORT}/api/auth/signin`);
  console.log(`  POST http://localhost:${PORT}/api/planner/create (auth required)`);
  console.log(`  GET  http://localhost:${PORT}/api/planner/my-plans (auth required)`);
  console.log(`  GET  http://localhost:${PORT}/api/planner/:id (auth required)`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
});

module.exports = app;

