import postgres from 'postgres';
import logger from './logger.service';

export interface PostgresServiceInput {
  username?: string
  password?: string
  host?: string
  port?: number
  database?: string
  connectionUrl?: string
}

export const createPostgreService = (input: PostgresServiceInput): postgres.Sql<{}> => {
  if (input.connectionUrl) {
    logger.debug(`PostgresSQL service created using connection url ${input.connectionUrl}`)
    return postgres(input.connectionUrl)
  }

  logger.debug('PostgresSQL service created')
  return postgres({
    host: input.host,
    port: input.port,
    database: input.database,
    username: input.username,
    password: input.password,
  })
}
export default createPostgreService