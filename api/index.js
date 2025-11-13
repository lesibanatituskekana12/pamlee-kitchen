// Vercel Serverless Function - API Handler
// This file handles all /api/* routes

try {
  const app = require('../server');
  module.exports = app;
} catch (error) {
  console.error('Error loading server:', error);
  
  // Export error handler
  module.exports = (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message
    });
  };
}
