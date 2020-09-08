import { server } from '@bot/panel/index'
import io from 'socket.io'
import authorization from '@bot/systems/authorization'

const socket = io(server)

socket.use((request, next) => {
  const token = request.handshake.query.token as string
  const isPublic = request.handshake.query.public as boolean
  console.log(request.handshake)
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
  return socket.of(space)
}
