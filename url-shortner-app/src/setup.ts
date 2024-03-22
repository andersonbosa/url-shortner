import config from './config'
import logger from './lib/logger.service'
import PostgresService from './lib/postgres.service'

const QUERIES = {
  createTable: /* SQL */`
    CREATE TABLE IF NOT EXISTS "url-shortner-db" (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE,
      original_url TEXT,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP
    )
  `
}

async function setup () {
  const postgresService = new PostgresService(config.database.postgres)

  try {
    const isHealth = await postgresService.healthCheck()
    if (!isHealth) {
      throw new Error('postgresService.healthCheck failed')
    }

    await postgresService.connect()
    await postgresService.query(QUERIES.createTable)
    logger.info('✅ Setup done successfully.')

  } catch (error) {
    logger.error('❌ Setup did not happen due to a error.')
    throw error

  } finally {
    await postgresService.disconnect()
  }
}

setup()