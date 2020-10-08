import { Router } from 'express'
import { RequestContext } from '@mikro-orm/core'

import commands from './commands'
import timers from './timers'
import users from './users'
import settings from './settings'
import events from './events'
import eventlist from './eventlist'
import keywords from './keywords'
import variables from './variables'
import greetings from './greetings'
import overlays from './overlays'
import widgets from './widgets'
import chatMessage from './chatMessage'
import files from './files'
import { orm } from '@bot/libs/db'

const router = Router()

router.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

router.get('/', (req, res) => {
  res.send('This is api v1')
})

router.use('/commands', commands)
router.use('/timers', timers)
router.use('/users', users)
router.use('/settings', settings)
router.use('/events', events)
router.use('/eventlist', eventlist)
router.use('/keywords', keywords)
router.use('/variables', variables)
router.use('/greetings', greetings)
router.use('/overlays', overlays)
router.use('/widgets', widgets)
router.use('/chatMessage', chatMessage)
router.use('/files', files)

export default router
