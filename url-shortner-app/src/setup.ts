import config from './config'
import PostgresService from './lib/postgres.service'

const QUERIES = {
  createTable: /* SQL */`
    CREATE TABLE IF NOT EXISTS url_shortner_db (
      id SERIAL PRIMARY KEY
      code TEXT UNIQUE,
      original_url TEXT,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP
    )
  `
}

async function setup () {
  const postgresService = new PostgresService({
    host: config.database.postgres.host,
    port: config.database.postgres.port,
    database: config.database.postgres.database,
    username: config.database.postgres.username,
    password: config.database.postgres.password,
  })

  
  try {
    await postgresService.connect()

    await postgresService.query(QUERIES.createTable)
    

    console.log('✅ Setup done successfully.')

  } catch (error) {
    console.log('❌ Setup did not happen due to a error.')

    throw error

  } finally {
    await postgresService.disconnect()
  }
}

setup()