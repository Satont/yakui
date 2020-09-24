import { getNameSpace } from '../Plugins/socket'

export default async () => {
  const socket = getNameSpace({ name: 'systems/metaData' })

  return new Promise((res) => {
    socket.emit('getData', data => res(data))
  })
}