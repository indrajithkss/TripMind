/**
 * Not Found Middleware
 * Handle 404 errors
 */

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found'
  });
};

module.exports = notFound;

