import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import timers from '@bot/systems/timers';
import { RequestContext, wrap } from '@mikro-orm/core';
import { prisma } from '@src/bot/libs/db';

const router = Router({
  mergeParams: true,
});

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const timers = await prisma.timers.findMany();

    res.json(timers);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const timer = await prisma.timers.findFirst({ where: { id: Number(req.params.id) } });

    res.json(timer);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  isAdmin,
  checkSchema({
    id: {
      isNumeric: true,
      in: ['body'],
      optional: true,
    },
    name: {
      isString: true,
      in: ['body'],
    },
    enabled: {
      isBoolean: true,
      in: ['body'],
      optional: true,
    },
    responses: {
      isArray: true,
      in: ['body'],
      optional: true,
    },
    interval: {
      isNumeric: true,
      in: ['body'],
      optional: true,
    },
    messages: {
      isNumeric: true,
      in: ['body'],
      optional: true,
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();

      const timer = req.body.id
        ? await prisma.timers.update({ where: { id: Number(req.body.id) }, data: req.body })
        : await prisma.timers.create({ data: req.body });

      await timers.init();
      res.json(timer);
    } catch (e) {
      next(e);
    }
  },
);

router.delete(
  '/',
  isAdmin,
  checkSchema({
    id: {
      isNumeric: true,
      in: ['body'],
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();

      await prisma.timers.delete({ where: { id: Number(req.body.id) } });
      await timers.init();
      res.send('Ok');
    } catch (e) {
      next(e);
    }
  },
);

export default router;
