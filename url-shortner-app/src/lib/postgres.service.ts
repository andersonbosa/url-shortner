import { Client } from 'pg'
import logger from './logger.service'

interface PostgresServiceInput {
  username: string
  password: string
  host: string
  port: number
  database: string
}

interface IPostgresService {
  connect (): Promise<boolean>
  disconnect (): Promise<boolean>
  query (sql: string, values?: any[]): Promise<any>
  healthCheck (): Promise<boolean>
}

class PostgresService implements IPostgresService {
  private client: Client
  private serviceInput: PostgresServiceInput

  constructor(input: PostgresServiceInput,) {
    this.serviceInput = input
    this.client = this.createClient(input)
  }

  private createClient (input: PostgresServiceInput): Client {
    const client = new Client({
      user: input.username,
      host: input.host,
      database: input.database,
      password: input.password,
      port: input.port,
    })
    logger.debug('Create new PostgreSQL client!')
    return client
  }

  async connect (): Promise<boolean> {
    try {
      await this.client.connect()
      logger.debug('Connected to PostgreSQL!')
      return true
    } catch (error) {
      logger.error('Error connecting to PostgreSQL:', error)
      return false
    }
  }

  async disconnect (): Promise<boolean> {
    try {
      await this.client.end()
      logger.debug('Disconnected from PostgreSQL!')
      this.client = this.createClient(this.serviceInput)
      return true
    } catch (error) {
      logger.error('Error disconnecting from PostgreSQL:', error)
      return false
    }
  }

  async query (sql: string, values?: any[]): Promise<any> {
    try {
      const result = await this.client.query(sql, values)
      return result.rows
    } catch (error) {
      logger.error('Error when executing the consultation:', error)
      throw error
    }
  }

  async healthCheck (): Promise<boolean> {
    try {
      await this.connect()
      await this.query('SELECT 1')
      logger.debug('PostgreSQL health check: OK')
      await this.disconnect()
      return true

    } catch (error) {
      logger.error('Error during the PostgreSQL health check:', error)
      await this.disconnect()
      return false
    }/* finally {
      await this.disconnect() && console.log('eu 1')
    }  */
  }
}

export default PostgresService
