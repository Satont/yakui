import moduleAlias from 'module-alias'
import { resolve } from 'path'

const production = process.env.NODE_ENV === 'production' ?? false

const paths = {
  src: production ? resolve(process.cwd(), 'dest') : resolve(process.cwd(), 'src'),
  bot: production ? resolve(process.cwd(), 'dest') : resolve(process.cwd(), 'src', 'bot')
}

moduleAlias.addAlias('@src', paths.src)
moduleAlias.addAlias('@bot', paths.bot)