import { Client } from 'pg'

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

  constructor(
    { host, port, database, username, password }: PostgresServiceInput,
  ) {
    this.client = new Client({
      user: username,
      host: host,
      database: database,
      password: password,
      port: port,
    })
  }

  async connect (): Promise<boolean> {
    try {
      await this.client.connect()
      console.log('Conectado ao PostgreSQL!')
      return true
    } catch (error) {
      console.error('Erro ao conectar ao PostgreSQL:', error)
      return false
    }
  }

  async disconnect (): Promise<boolean> {
    try {
      await this.client.end()
      console.log('Desconectado do PostgreSQL!')
      return true
    } catch (error) {
      console.error('Erro ao desconectar do PostgreSQL:', error)
      return false
    }
  }

  async query (sql: string, values?: any[]): Promise<any> {
    try {
      const result = await this.client.query(sql, values)
      return result.rows
    } catch (error) {
      console.error('Erro ao executar a consulta:', error)
      throw error
    }
  }

  async healthCheck (): Promise<boolean> {
    try {
      await this.connect()
      await this.query('SELECT 1')
      return true

    } catch (error) {
      console.error('Erro durante o teste de conexão com o PostgreSQL:', error)
      return false

    } finally {
      await this.disconnect()
    }
  }
}

export default PostgresService
