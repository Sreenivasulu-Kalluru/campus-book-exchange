// server/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // Look for a status code that was already set, or default to 500
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  // Respond with a clean JSON object
  res.json({
    message: err.message,
    // We only show the stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};
