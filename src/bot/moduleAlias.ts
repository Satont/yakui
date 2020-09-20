import moduleAlias from 'module-alias'
import { resolve } from 'path'

const isProduction = process.env.NODE_ENV === 'production'

const paths = {
  src: isProduction ? resolve(process.cwd(), 'dest') : resolve(process.cwd(), 'src'),
  bot: isProduction ? resolve(process.cwd(), 'dest') : resolve(process.cwd(), 'src', 'bot')
}

moduleAlias.addAlias('@src', paths.src)
moduleAlias.addAlias('@bot', paths.bot)