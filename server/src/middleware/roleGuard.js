import ApiError from '../utils/apiError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Role '${req.user.role}' is not authorized`));
    }
    next();
  };
};
