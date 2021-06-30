import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import cache from '@bot/libs/cache';
import { RequestContext, wrap } from '@mikro-orm/core';
import { prisma } from '@bot/libs/db';
import { Keywords } from '.prisma/client';

const router = Router({
  mergeParams: true,
});

router.get('/', async (req, res, next) => {
  try {
    res.json([...cache.keywords.values()]);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const keyword = cache.keywords.get(req.params.id);

    res.json(keyword);
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
    response: {
      isString: true,
      in: ['body'],
      optional: true,
    },
    cooldown: {
      isNumeric: true,
      in: ['body'],
      optional: true,
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();
      const keyword = req.body.id
        ? await prisma.keywords.update({ where: { id: Number(req.body.id) }, data: req.body })
        : await prisma.keywords.create({ data: req.body });

      await cache.updateKeywords();
      res.json(keyword);
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
      await prisma.keywords.delete({ where: { id: Number(req.body.id) } });
      await cache.updateKeywords();
      res.send('Ok');
    } catch (e) {
      next(e);
    }
  },
);

export default router;
