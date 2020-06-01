import { Router } from 'express'
import commands from './commands'
import timers from './timers'
import metaData from './metaData'

const router = Router()

router.get('/', (req, res) => {
  res.send('This is api v1')
})

router.use('/commands', commands)
router.use('/timers', timers)
router.use('/metaData', metaData)

export default router
