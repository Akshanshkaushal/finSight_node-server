const newsService = require('../services/newsService');
const { NotFoundError } = require('../../../common/errors');

class NewsController {
  async getNews(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        impactLevel: req.query.impactLevel,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 20,
        skip: parseInt(req.query.skip) || 0
      };

      const news = await newsService.getNews(filters);
      
      res.json({
        success: true,
        data: news,
        count: news.length,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async getNewsById(req, res, next) {
    try {
      const { newsId } = req.params;
      const news = await newsService.getNewsById(newsId);
      
      if (!news) {
        throw new NotFoundError('News article');
      }
      
      res.json({
        success: true,
        data: news,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async triggerFetch(req, res, next) {
    try {
      const verifiedNews = await newsService.fetchAndVerifyNews();
      
      res.json({
        success: true,
        message: `Fetched and verified ${verifiedNews.length} news articles`,
        data: verifiedNews,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NewsController();

