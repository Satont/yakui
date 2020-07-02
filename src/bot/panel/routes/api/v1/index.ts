import { Router } from 'express'
import commands from './commands'
import timers from './timers'
import users from './users'
import settings from './settings'
import events from './events'
import metaData from './metaData'
import keywords from './keywords'
import variables from './variables'
import greetings from './greetings'
import markers from './markers'

const router = Router()

router.get('/', (req, res) => {
  res.send('This is api v1')
})
router.use('/metaData', metaData)

router.use('/commands', commands)
router.use('/timers', timers)
router.use('/users', users)
router.use('/settings', settings)
router.use('/events', events)
router.use('/keywords', keywords)
router.use('/variables', variables)
router.use('/greetings', greetings)
router.use('/markers', markers)

export default router
