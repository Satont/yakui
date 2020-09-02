import _Vue from 'vue'
import io from 'socket.io-client'

const location = window.location.origin
const options = {
  query: {
    token: localStorage.getItem('accessToken')
  }
}

const socket = io(location, options)

export default socket

export const getNameSpace = (name: string, opts: IOptions = {}) => {
  return io(`${location}/${name}`, {
    ...options,
    ...opts,
    forceNew: true,
  })
}

interface IOptions {
  public?: boolean;
}
