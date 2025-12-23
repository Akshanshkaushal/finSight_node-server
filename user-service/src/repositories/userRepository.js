const UserProfile = require('../models/UserProfile');
const Loan = require('../models/Loan');
const redis = require('../config/redis');
const config = require('../config');
const { NotFoundError } = require('../../../common/errors');

class UserRepository {
  async getProfile(userId) {
    // Try cache first
    const cacheKey = `user:profile:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundError('User profile');
    }

    const loans = await Loan.findAll({ where: { userId } });
    const result = {
      ...profile.toJSON(),
      loans: loans.map(loan => loan.toJSON())
    };

    // Cache result
    await redis.setex(cacheKey, config.redis.ttl, JSON.stringify(result));

    return result;
  }

  async createOrUpdateProfile(userId, profileData) {
    const [profile, created] = await UserProfile.upsert({
      userId,
      ...profileData
    }, {
      returning: true
    });

    // Invalidate cache
    await redis.del(`user:profile:${userId}`);

    return profile.toJSON();
  }

  async addLoan(userId, loanData) {
    const loan = await Loan.create({
      userId,
      ...loanData
    });

    // Invalidate cache
    await redis.del(`user:profile:${userId}`);

    return loan.toJSON();
  }

  async updateLoan(loanId, userId, loanData) {
    const loan = await Loan.findOne({ where: { loanId, userId } });
    if (!loan) {
      throw new NotFoundError('Loan');
    }

    await loan.update(loanData);

    // Invalidate cache
    await redis.del(`user:profile:${userId}`);

    return loan.toJSON();
  }

  async deleteLoan(loanId, userId) {
    const loan = await Loan.findOne({ where: { loanId, userId } });
    if (!loan) {
      throw new NotFoundError('Loan');
    }

    await loan.destroy();

    // Invalidate cache
    await redis.del(`user:profile:${userId}`);
  }
}

module.exports = new UserRepository();

