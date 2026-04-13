import app from './app.js';
import config from './config/env.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

const start = async () => {
  await connectDB();
  app.listen(config.PORT, () => {
    logger.info(`NyayaAI server running on port ${config.PORT}`);
  });
};

start();
