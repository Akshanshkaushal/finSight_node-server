// Structured logging utility

const winston = require('winston');

const createLogger = (serviceName) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, service, correlationId, ...meta }) => {
            let log = `${timestamp} [${service}] ${level}: ${message}`;
            if (correlationId) log += ` [correlationId: ${correlationId}]`;
            if (Object.keys(meta).length > 0) log += ` ${JSON.stringify(meta)}`;
            return log;
          })
        )
      })
    ]
  });
};

module.exports = { createLogger };

