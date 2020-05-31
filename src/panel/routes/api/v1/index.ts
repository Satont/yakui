import { Router } from 'express'
import commands from './commands'

const router = Router()

router.get('/', (req, res) => {
  res.send('This is api v1')
})

router.use('/commands', commands)

export default router
