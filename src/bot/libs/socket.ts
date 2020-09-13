import { server } from '@bot/panel/index'
import io from 'socket.io'
import authorization from '@bot/systems/authorization'
import { info } from './logger'

const socket = io(server)

socket.use((request, next) => {
  const token = request.handshake.query.token as string
  const isPublic = request.handshake.query.isPublic === 'true'

  try {
    if (isPublic) return next()
    else if (!token || !authorization.verify(token)) return next(new Error('Unauthorized.'))
    else next()
  } catch (e) {
    next(e)
  }
})

export default socket

export const getNameSpace = (space: string) => {
  const namespace = socket.of(space)
  info(`Libs::Socket: namespace ${namespace.name} successfuly created.`)
  return namespace
}
