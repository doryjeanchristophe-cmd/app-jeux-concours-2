// logger.js — Système de logs
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/scraper.log', maxsize: 5 * 1024 * 1024 })
  ]
});

module.exports = logger;
