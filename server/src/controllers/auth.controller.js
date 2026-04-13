import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';

const signToken = (id) => jwt.sign({ id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

export const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, role, courtName } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, hashedPassword, fullName, role, courtName });

  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    access_token: token,
    token_type: 'bearer',
    user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role, courtName: user.courtName, isActive: user.isActive, createdAt: user.createdAt },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+hashedPassword');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.hashedPassword);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

  const token = signToken(user._id);
  res.json({
    success: true,
    access_token: token,
    token_type: 'bearer',
    user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role, courtName: user.courtName, isActive: user.isActive, createdAt: user.createdAt },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
