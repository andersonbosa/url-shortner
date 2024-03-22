import { RedisClientType, createClient } from 'redis'
import { URL } from 'node:url'
import logger from './logger.service'

export interface RedisServiceInput {
  host: string
  port: number
  username: string
  password: string
}

class RedisService {
  private client: RedisClientType

  constructor(input: RedisServiceInput) {
    const clientUrl: string = this.generateUrl({
      host: input.host,
      port: input.port,
      username: input.username,
      password: input.password,
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
        logger.debug('Conectado ao Redis!')
        resolve()
      })
      this.client.on('error', (error: Error) => {
        logger.error('Erro ao conectar ao Redis:', error)
        reject(error)
      })
    })
  }

  async disconnect (): Promise<void> {
    this.client.quit()
    logger.debug('Desconectado do Redis!')
  }

  async set (key: string, value: string): Promise<void> {
    this.client.set(key, value)
  }

  async get (key: any): Promise<string | null> {
    return await this.client.get(key) 
    // return new Promise<string | null>((resolve, reject) => {
    //   this.client.get(
    //     key,
    //     (error: Error | null, result: string | null) => {
    //       if (error) {
    //         console.error('Erro ao obter valor do Redis:', error)
    //         reject(error)
    //       } else {
    //         resolve(result)
    //       }
    //     }
    //   )
    // })
  }
}

export default RedisService
