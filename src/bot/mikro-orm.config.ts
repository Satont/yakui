import { Options } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'

export default {
  tsNode: true,
  metadataProvider: TsMorphMetadataProvider,
  dbName: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  type: 'postgresql',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  baseDir: process.cwd(),
  entities: ['./dest/entities'],
  entitiesTs: ['./src/bot/entities'],
  cache: { pretty: true },
} as Options
