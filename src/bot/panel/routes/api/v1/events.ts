import { Router } from 'express';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import cache from '@bot/libs/cache';
import { prisma } from '@bot/libs/db';

const router = Router();

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const events = [...cache.events.values()];

    res.send(events);
  } catch (e) {
    next(e);
  }
});

router.post('/', isAdmin, async (req, res, next) => {
  try {
    const data: { name: string; operations: any[] } = req.body;

    const event = await prisma.events.upsert({
      where: {
        name: data.name,
      },
      update: {
        operations: data.operations,
      },
      create: {
        name: data.name,
        operations: data.operations,
      },
    });

    await cache.updateEvents();
    res.send(event);
  } catch (e) {
    next(e);
  }
});

export default router;
