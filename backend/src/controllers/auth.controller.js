import bcrypt from 'bcryptjs';
import User from '../../../../models/User.model.js';
import { generateTokens } from '../utils/generateToken.js';

const formatUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  university: user.university,
  college: user.college,
  branch: user.branch,
  semester: user.semester,
  role: user.role
});

const issueTokens = async (userId, isNewUser = false) => {
  try {
    // Validate JWT secrets are available
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets are not configured. Please check your .env file.');
    }
    const tokens = generateTokens({ userId });
    
    // Only perform an atomic update if it's an existing user.
    // New users will save their token during their initial creation to prevent double-writes.
    if (!isNewUser) {
      await User.updateOne({ _id: userId }, { $set: { refreshToken: tokens.refreshToken } });
    }
    
    return tokens;
  } catch (error) {
    console.error('Token generation error:', error);
    throw error;
  }
};

export const registerUser = async (req, res) => {
  try {
    const { email, password, name, university, college, branch, semester } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user object first
    const user = new User({
      email,
      password: hashedPassword,
      name,
      university,
      college,
      branch,
      semester
    });

    // Generate tokens BEFORE saving to eliminate redundant database writes
    const tokens = await issueTokens(user._id, true);
    user.refreshToken = tokens.refreshToken;

    // Perform a SINGLE database write to dramatically improve signup speed
    await user.save();

    res.status(201).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Atomic update bypasses heavy Mongoose document lifecycle for faster logins
    const tokens = await issueTokens(user._id, false);
    user.refreshToken = tokens.refreshToken;

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    if (user.refreshToken !== req.refreshToken) {
      return res.status(403).json({ message: 'Refresh token mismatch' });
    }

    const tokens = await issueTokens(user._id, false);
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

