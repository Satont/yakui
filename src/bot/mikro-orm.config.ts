import dotenv from 'dotenv'
import { Options, EntityCaseNamingStrategy  } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { info } from './libs/logger'

dotenv.config()

export default {
  logger: (msg: string) => info(msg),
  debug: true,
  metadataProvider: TsMorphMetadataProvider,
  dbName: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  type: 'postgresql',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  baseDir: process.cwd(),
  entities: ['./dest/entities/**/*.js'],
  entitiesTs: ['./src/bot/entities/**/*.ts'],
  cache: { pretty: true },
  namingStrategy: EntityCaseNamingStrategy ,
  pool: {
    min: 1,
    max: 10,
  },
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './src/bot/data/migrations',
    transactional: true,
    dropTables: true,
    safe: true,
    emit: 'ts',
  },
} as Options
