function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

// Express error handler signature: (err, req, res, next)
function errorHandler(err, req, res, next) {
  // Default to 500 unless already set
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Server Error",
    // Only expose stack in non-prod
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
