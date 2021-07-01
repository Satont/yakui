import { Router } from 'express';
import axios from 'axios';
import { error } from '@bot/libs/logger';
import oauth from '../../libs/oauth';

const router = Router();

router.get('/auth/callback', async (req, res) => {
  const state = JSON.parse(Buffer.from(req.query.state as string, 'base64').toString('utf-8'));
  const code = req.query.code;

  const query = {
    client_id: oauth.clientId,
    client_secret: oauth.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: `https://yakui.tk/misc/twitch/auth/flows/code/`,
  };

  try {
    const { data } = await axios.post(`https://id.twitch.tv/oauth2/token`, null, { params: query });

    oauth[`${state.type}AccessToken`] = data.access_token;
    oauth[`${state.type}RefreshToken`] = data.refresh_token;
  } catch (e) {
    error(e);
  }
  res.redirect('/');
});

export default router;
