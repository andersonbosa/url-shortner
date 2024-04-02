
export interface IDependencyContainer {
  services: {
    postgres: any
    redis: any
  }
  plugins: {
    [key: string]: any
  }
}

export interface ILinkEntity {
  id: number
  code: string
  original_url: string
  created_at: string
}

export interface ILinksController {
  getShortlinks (): Promise<ILinkEntity[] | null>
  getShortlink (code: string): Promise<ILinkEntity | null>
  createShortlink (code:string, url:string): Promise<ILinkEntity>
}