import { Router } from 'express'
import axios from 'axios'
import { IWebHookModeratorRemove, IWebHookModeratorAdd, IWebHookUserFollow, IWebHookStreamChanged } from 'typings/events'
import { onAddModerator, onRemoveModerator, onUserFollow, onStreamChange } from '@bot/libs/eventsCaller'
import { error } from '@bot/libs/logger'
import { inspect } from 'util'
import oauth from '../../libs/oauth'

const router = Router()

router.get('/', (req, res) => res.send('ok'))

router.get('/auth/callback', async (req, res) => {
  const state = JSON.parse(Buffer.from(req.query.state as string, 'base64').toString('utf-8'))
  const code = req.query.code

  const query = {
    client_id: oauth.clientId,
    client_secret: oauth.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: `https://yakui.tk/misc/twitch/auth/flows/code/`,
  }

  try {
    const { data } = await axios.post(`https://id.twitch.tv/oauth2/token`, null, { params: query })

    oauth[`${state.type}AccessToken`] = data.access_token
    oauth[`${state.type}RefreshToken`] = data.refresh_token
  } catch (e) {
    error(e)
  }
  res.redirect('/')
})

router.get('/webhooks/callback', (req, res) => {
  res.send(req.query['hub.challenge'])
})

const cache = {
  followers: new Set(),
  webhooks: new Set(),
}

setInterval(() => {
  cache.followers.clear()
  cache.webhooks.clear()
}, 30 * 60 * 1000)

router.post('/webhooks/callback', (req, res) => {
  res.sendStatus(200)
  if (cache.webhooks.has(req.headers['twitch-notification-id'])) return

  try {
    cache.webhooks.add(req.headers['twitch-notification-id'])
    for (const item of req.body.data) {
      if (item.event_type === 'moderation.moderator.add') {
        onAddModerator(item as IWebHookModeratorAdd)
        continue
      } else if (item.event_type === 'moderation.moderator.remove') {
        onRemoveModerator(item as IWebHookModeratorRemove)
        continue
      } else if (item.from_id && item.to_id && !cache.followers.has(item.from_id)) {
        onUserFollow(item as IWebHookUserFollow)
        cache.followers.add(item.from_id)
        continue
      } else if (item.thumbnail_url) {
        onStreamChange(item as IWebHookStreamChanged)
        continue
      } else {
        error(`EXPRESS WEBHOOKS: Unknown event ${inspect(item)}`)
      }
    }
  } catch (e) {
    error(e)
  }
})

export default router
