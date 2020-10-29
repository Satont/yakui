import { System } from 'typings'
import { getNameSpace } from '@bot/libs/socket'
import users from '@bot/systems/users'
import tmi from '@bot/libs/tmi'

export default new class Chat implements System {
  socket = getNameSpace('widgets/chat')
  clients: SocketIO.Socket[] = []

  async sockets(client: SocketIO.Socket) {
    client.on('getData', async (cb) => {
      const data = {
        chatters: users.chatters.length,
      }

      cb(data)
    })
    client.on('sendMessage', message => {
      tmi.say({ message })
    })
  }
}
