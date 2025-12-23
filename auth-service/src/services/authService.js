const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const config = require('../config');
const { ValidationError, AuthenticationError } = require('../../../common/errors');

class AuthService {
  async register(email, password) {
    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword
    });

    return {
      userId: user.userId,
      email: user.email
    };
  }

  async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.userId, user.email);
    const refreshToken = this.generateRefreshToken(user.userId);

    // Store refresh token
    await user.update({ refreshToken });

    return {
      userId: user.userId,
      email: user.email,
      accessToken,
      refreshToken
    };
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret);
      const user = await User.findOne({ where: { userId: decoded.userId } });

      if (!user || user.refreshToken !== refreshToken) {
        throw new AuthenticationError('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user.userId, user.email);
      return { accessToken };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  async logout(userId) {
    const user = await User.findOne({ where: { userId } });
    if (user) {
      await user.update({ refreshToken: null });
    }
  }

  generateAccessToken(userId, email) {
    return jwt.sign(
      { userId, email, type: 'access' },
      config.jwtSecret,
      { expiresIn: config.accessTokenExpiry }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      config.jwtSecret,
      { expiresIn: config.refreshTokenExpiry }
    );
  }
}

module.exports = new AuthService();

