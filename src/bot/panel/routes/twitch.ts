import { Router } from 'express'
import { IWebHookModeratorRemove, IWebHookModeratorAdd, IWebHookUserFollow, IWebHookStreamChanged } from 'typings/events'
import { onAddModerator, onRemoveModerator, onUserFollow, onStreamChange } from '@bot/libs/eventsCaller'
import { error } from '@bot/libs/logger'
import { inspect } from 'util'

const router = Router()

router.get('/', (req, res) => res.send('ok'))

router.get('/webhooks/callback', (req, res) => {
  res.send(req.query['hub.challenge'])
})

const cache = {
  followers: [],
}

router.post('/webhooks/callback', (req, res) => {
  try {
    for (const item of req.body.data) {
      if (item.event_type === 'moderation.moderator.add') {
        onAddModerator(item as IWebHookModeratorAdd)
        continue
      } else if (item.event_type === 'moderation.moderator.remove') {
        onRemoveModerator(item as IWebHookModeratorRemove)
        continue
      } else if (item.from_id && item.to_id && !cache.followers.includes(item.from_id)) {
        onUserFollow(item as IWebHookUserFollow)
        cache.followers.push(item.from_id)
        continue
      } else if (item.thumbnail_url) {
        onStreamChange(item as IWebHookStreamChanged)
        continue
      } else {
        error(`EXPRESS WEBHOOKS: Unknown event ${inspect(item)}`)
      }
    }
  
    res.sendStatus(200)
  } catch (e) {
    console.error(e)
    res.sendStatus(200)
  }
})

export default router
