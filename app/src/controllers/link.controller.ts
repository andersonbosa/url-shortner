import { IDependencyContainer, ILinkEntity, ILinksController } from '../ports'

export class LinksController implements ILinksController {
  constructor(
    private dependencyContainer: IDependencyContainer
  ) { }


  async getShortlinks (): Promise<ILinkEntity[] | null> {
    const results = await this.dependencyContainer.services.postgres/* sql */`
    SELECT *
    FROM "url-shortner-db"
    ORDER BY created_at DESC`

    return results
  }
  
  async getShortlink (code: string): Promise<ILinkEntity | null> {
    const results = await this.dependencyContainer.services.postgres/* sql */`
    SELECT id, original_url
    FROM "url-shortner-db"
    WHERE code = ${code}`

    const foundLink = results[0]

    return foundLink
  }

  async createShortlink (code: string, url: string): Promise<ILinkEntity> {
    const results = await this.dependencyContainer.services.postgres/* sql */`
    INSERT INTO "url-shortner-db" (code, original_url)
    VALUES (${code}, ${url})
    RETURNING *`
    const createdLink = results[0]

    return createdLink
  }
}