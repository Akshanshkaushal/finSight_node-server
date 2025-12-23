const { SERVICE_PORTS } = require('../../common/constants');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.ML_SERVICE
};

