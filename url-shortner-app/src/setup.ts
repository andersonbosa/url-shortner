import config from './config'
import logger from './lib/logger.service'
import { createPostgreService } from './lib/postgres.service'


async function setup() {
  const pgService = createPostgreService(config.database.postgres)

  try {
    await pgService/* SQL */`
      CREATE TABLE IF NOT EXISTS "url-shortner-db" (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE,
      original_url TEXT,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP
      )`
    logger.info('✅ Setup done successfully.')

  } catch (error) {
    logger.error('❌ Setup did not happen due to a error.')
    throw error
  }
}

setup()