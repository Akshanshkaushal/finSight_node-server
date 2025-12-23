const express = require('express');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.get('/', newsController.getNews.bind(newsController));
router.get('/:newsId', newsController.getNewsById.bind(newsController));
router.post('/fetch', newsController.triggerFetch.bind(newsController));

module.exports = router;

