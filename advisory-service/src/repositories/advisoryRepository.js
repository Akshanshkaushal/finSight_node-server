const Advisory = require('../models/Advisory');

class AdvisoryRepository {
  async create(advisoryData) {
    const advisory = await Advisory.create(advisoryData);
    return advisory.toJSON();
  }

  async findByUserId(userId, options = {}) {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    const advisories = await Advisory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return advisories.map(adv => adv.toJSON());
  }

  async findById(advisoryId) {
    const advisory = await Advisory.findOne({ where: { advisoryId } });
    return advisory ? advisory.toJSON() : null;
  }

  async countByUserId(userId, startDate, endDate) {
    const where = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.$gte = startDate;
      if (endDate) where.createdAt.$lte = endDate;
    }

    return await Advisory.count({ where });
  }
}

module.exports = new AdvisoryRepository();

