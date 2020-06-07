import { Router } from "express";
import { IWebHookModeratorRemove, IWebHookModeratorAdd, IWebHookUserFollow, IWebHookStreamChanged } from 'typings/webhooks'
import { onAddModerator, onRemoveModerator, onUserFollow, onStreamChange } from "../../../bot/libs/eventsCaller";
import { error } from "../../../bot/libs/logger";

const router = Router()

router.get('/', (req, res) => res.send('ok'))

router.get('/webhooks/callback', (req, res) => {
  res.send(req.query['hub.challenge']);
})

router.post('/webhooks/callback', (req, res, next) => {
  for (const item of req.body.data) {
    if (item.event_type === 'moderation.moderator.add') {
      onAddModerator(item as IWebHookModeratorAdd)
      continue;
    } else if (item.event_type === 'moderation.moderator.remove') {
      onRemoveModerator(item as IWebHookModeratorRemove)
      continue
    } else if (item.from_id && item.to_id) {
      onUserFollow(item as IWebHookUserFollow)
      continue;
    } else if (item.title && item.viewer_count) {
      onStreamChange(item as IWebHookStreamChanged)
      continue
    } else {
      error(`EXPRESS WEBHOOKS: Unknown event ${item}`)
    }
  }

  res.sendStatus(200)
})

export default router