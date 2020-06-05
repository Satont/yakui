import { Router } from 'express'
import commands from './commands'
import timers from './timers'
import users from './users'
import settings from './settings'
import events from './events'
import metaData from './metaData'

const router = Router()

router.get('/', (req, res) => {
  res.send('This is api v1')
})

router.use('/commands', commands)
router.use('/timers', timers)
router.use('/users', users)
router.use('/settings', settings)
router.use('/events', events)
router.use('/metaData', metaData)

export default router
