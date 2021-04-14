import { Router } from 'express';
import { Event } from '@bot/entities/Event';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import cache from '@bot/libs/cache';
import { RequestContext } from '@mikro-orm/core';

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
    const data: { name: string, operations: any[] } = req.body;
    const repository = RequestContext.getEntityManager().getRepository(Event);

    const event = await repository.findOne({ name: data.name }) || repository.create({ name: data.name, operations: data.operations });

    event.operations = data.operations;
    await repository.persistAndFlush(event);

    await cache.updateEvents();
    res.send(event);
  } catch (e) {
    next(e);
  }
});

export default router;
