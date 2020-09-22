import io from 'socket.io-client'
import { merge } from 'lodash'

const location = window.location.origin
const options = {
  query: {
    token: localStorage.getItem('accessToken')
  }
}

const socket = io(location, options)

export default socket

export const getNameSpace = ({ name, opts = {} }: { name: string, opts?: IOptions }) => {
  return io(`${location}/${name}`, {
    ...merge(options, opts),
    forceNew: true,
  })
}

interface IOptions {
  query?: {
    isPublic?: boolean;
  }
}
