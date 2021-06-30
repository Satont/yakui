import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import OverlaysSystem from '@bot/systems/overlays';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import cache from '@bot/libs/cache';
import { RequestContext, wrap } from '@mikro-orm/core';
import { Overlays } from '@prisma/client';
import { prisma } from '@src/bot/libs/db';

const router = Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
  try {
    res.json([...cache.overlays.values()]);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const overlay = OverlaysSystem.getOverlay(req.params.id);

    res.json(overlay);
  } catch (e) {
    next(e);
  }
});

router.get('/parse/:id', async (req, res, next) => {
  try {
    const data = await OverlaysSystem.parseOverlayData(req.params.id);

    res.json(data);
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
      optional: {
        options: { nullable: true },
      },
    },
    name: {
      isString: true,
      in: ['body'],
    },
    data: {
      isString: true,
      in: ['body'],
    },
    css: {
      isString: true,
      in: ['body'],
      optional: {
        options: { nullable: true },
      },
    },
    js: {
      isArray: true,
      in: ['body'],
      optional: {
        options: { nullable: true },
      },
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();

      const overlay = req.body.id
        ? await prisma.overlays.update({ where: { id: Number(req.body.id) }, data: req.body })
        : await prisma.overlays.create({ data: req.body });

      await cache.updateOverlays();
      res.json(overlay);
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
      await prisma.overlays.delete({ where: { id: Number(req.body.id) } });

      await cache.updateOverlays();
      res.send('Ok');
    } catch (e) {
      next(e);
    }
  },
);

export default router;
