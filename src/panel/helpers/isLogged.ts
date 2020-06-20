import axios from 'axios'

export default async (shouldBeLogged = true) => {
  try {
    const code = localStorage.getItem('code') || ''
    if (code.trim().length === 0) {
      if (!shouldBeLogged) return null;
      else window.location.replace(window.location.origin + '/login')
    }

    let clientId = localStorage.getItem('clientId') || '';
    if (clientId.length === 0) {
      const { data } = await axios.get(`https://id.twitch.tv/oauth2/validate`, {
        headers: {
            'Authorization': 'OAuth ' + code,
          },
        });
      clientId = data.client_id;
      localStorage.setItem('clientId', clientId);
    }

    const user = await axios.get(`https://api.twitch.tv/helix/users`, { headers: {
      'Authorization': 'Bearer ' + code,
      'Client-Id': clientId,
    }})

    if (!user.data.data.length) {
      localStorage.removeItem('userId')
      throw Error('User must be logged');
    }

    localStorage.setItem('userId', user.data.data[0].id)

    //const accessToken = localStorage.getItem('accessToken') || '';
    //const refreshToken = localStorage.getItem('refreshToken') || '';
    //const isNewAuthorization = accessToken.trim().length === 0 || refreshToken.trim().length === 0;

    const request = await axios.get('/oauth/validate', { headers: {
      'x-twitch-token': code,
      'x-twitch-userid': user.data.data[0].id,
     }})

    localStorage.setItem('accessToken', request.data.accessToken);
    localStorage.setItem('refreshToken', request.data.refreshToken);
    localStorage.setItem('userType', request.data.userType);


    if (localStorage.getItem('userType') !== 'admin') {
      throw 'You have no access to view that.'
    }

    return user.data.data[0]
  } catch (e) {
    console.error(e)
    if (e === 'You have no access to view that.') {
      window.location.replace(window.location.origin + '/public');
    } else {
      window.location.replace(window.location.origin + '/login');
    }

    return null
  }
}
