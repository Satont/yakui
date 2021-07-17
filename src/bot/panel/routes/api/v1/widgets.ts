import { Router, Request, Response, NextFunction } from 'express';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import { checkSchema, validationResult } from 'express-validator';
import { prisma } from '@bot/libs/db';

const router = Router();

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const widgets = await prisma.widgets.findMany();

    res.json(widgets);
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
    y: {
      isNumeric: true,
      in: ['body'],
    },
    x: {
      isNumeric: true,
      in: ['body'],
    },
    w: {
      isNumeric: true,
      in: ['body'],
    },
    h: {
      isNumeric: true,
      in: ['body'],
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();

      const widget = await prisma.widgets.upsert({
        where: {
          id: req.body.id,
        },
        update: req.body,
        create: req.body,
      });

      res.json(widget);
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
      await prisma.widgets.delete({ where: { id: Number(req.body.id) } });
      res.json('Ok');
    } catch (e) {
      next(e);
    }
  },
);

export default router;
