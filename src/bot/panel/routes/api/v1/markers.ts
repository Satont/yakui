import { Router} from 'express'
import Markers from '@bot/systems/markers'
import isAdmin from '@bot/panel/middlewares/isAdmin'

const router = Router({
  mergeParams: true
})

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const markers = await Markers.getList()

    res.json(markers)
  } catch (e) {
    next(e)
  }
})

export default router
