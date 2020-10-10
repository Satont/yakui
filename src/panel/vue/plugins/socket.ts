import io from 'socket.io-client'
import { merge } from 'lodash'

const location = window.location.origin

const socket = io(location, {
  query: {
    token: localStorage.getItem('accessToken'),
  },
})

export default socket

export const getNameSpace = ({ name, opts = {} }: { name: string, opts?: IOptions }) => {
  const options = {
    query: {
      token: localStorage.getItem('accessToken'),
    },
  }
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
