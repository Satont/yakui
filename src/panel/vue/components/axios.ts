import axios from 'axios'

export default axios.create({
  baseURL: '/api/v1',
  headers: {
    'x-twitch-token': localStorage.getItem('accessToken')
  }
})
