import config from '../config/env.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
  logger.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
