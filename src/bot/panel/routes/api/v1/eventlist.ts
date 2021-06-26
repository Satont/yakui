import { Router } from 'express';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import { prisma } from '@bot/libs/db';

const router = Router({
  mergeParams: true,
});

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const eventlist = await prisma.eventList.findMany({ take: 100, orderBy: { timestamp: 'desc' } });

    res.send(eventlist);
  } catch (e) {
    next(e);
  }
});

export default router;
