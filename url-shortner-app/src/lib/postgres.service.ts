
import { Client } from 'pg'

interface PostgresServiceInput {
  user: string
  host: string
  database: string
  password: string
  port: number
}

class PostgresService {
  private client: Client

  constructor({ user, host, database, password, port }: PostgresServiceInput) {
    this.client = new Client({
      user: user,
      host: host,
      database: database,
      password: password,
      port: port,
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
