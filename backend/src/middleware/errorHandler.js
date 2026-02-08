export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({ error: 'Invalid reference' });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
  });
};
