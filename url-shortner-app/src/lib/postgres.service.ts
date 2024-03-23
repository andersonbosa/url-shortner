import postgres from 'postgres';

export interface PostgresServiceInput {
  username: string
  password: string
  host: string
  port: number
  database: string
}

export const createPostgreService = (input: PostgresServiceInput): postgres.Sql<{}> => postgres({
  host: input.host,
  port: input.port,
  database: input.database,
  username: input.username,
  password: input.password,
})

export default createPostgreService