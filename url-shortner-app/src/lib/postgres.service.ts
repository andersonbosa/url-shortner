
import { Client, ClientConfig } from 'pg'

interface PostgresServiceInput {
  username: string
  password: string
  host: string
  port: number
  database: string
}

class PostgresService {
  // private client: Client
  public client: Client

  constructor({ host, port, database, username, password }: PostgresServiceInput, options: ClientConfig = {}) {
    this.client = new Client({
      user: username,
      host: host,
      database: database,
      password: password,
      port: port,
      ...options
    })
  }

  async connect () {
    try {
      await this.client.connect()
      console.log('Conectado ao PostgreSQL!')
    } catch (error) {
      console.error('Erro ao conectar ao PostgreSQL:', error)
    }
  }

  async disconnect () {
    try {
      await this.client.end()
      console.log('Desconectado do PostgreSQL!')
    } catch (error) {
      console.error('Erro ao desconectar do PostgreSQL:', error)
    }
  }

  async query (sql: string, values?: any[]) {
    try {
      const result = await this.client.query(sql, values)
      return result.rows
    } catch (error) {
      console.error('Erro ao executar a consulta:', error)
      throw error
    }
  }
}

export default PostgresService
