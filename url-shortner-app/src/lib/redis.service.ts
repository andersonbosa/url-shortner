import { URL } from 'url'

import { RedisClientType, createClient } from 'redis'


interface RedisServiceInput {
  host: string
  port: number
  username: string
  password: string
}

class RedisService {
  private client: RedisClientType

  constructor({ host, port, username, password }: RedisServiceInput) {
    const clientUrl: string = this.generateUrl({
      host: host,
      port: port,
      username: username,
      password: password,
    })

    this.client = createClient({ url: clientUrl })
  }

  private generateUrl ({ host, port, username, password }: RedisServiceInput): string {
    const urlObj = new URL('redis://')
    urlObj.hostname = host
    urlObj.port = port.toString()
    urlObj.username = username
    urlObj.password = password ?? ''

    return urlObj.toString()
  }

  async connect (): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Conectado ao Redis!')
        resolve()
      })
      this.client.on('error', (error: Error) => {
        console.error('Erro ao conectar ao Redis:', error)
        reject(error)
      })
    })
  }

  async disconnect (): Promise<void> {
    this.client.quit()
    console.log('Desconectado do Redis!')
  }

  async set (key: string, value: string): Promise<void> {
    this.client.set(key, value)
  }

  async get (key: string): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      this.client.get(key, (error: Error | null, result: string | null) => {
        if (error) {
          console.error('Erro ao obter valor do Redis:', error)
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}

export default RedisService
