import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import variables from '@bot/systems/variables';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import { RequestContext, wrap } from '@mikro-orm/core';
import { prisma } from '@src/bot/libs/db';

const router = Router({
  mergeParams: true,
});

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.variables.findMany());
  } catch (e) {
    next(e);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    res.json(variables.variables);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    res.json(await prisma.variables.findFirst({ where: { id: Number(req.params.id) } }));
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
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();

      const variable = req.body.id
        ? await prisma.variables.update({ where: { id: Number(req.body.id) }, data: req.body })
        : await prisma.variables.create({ data: req.body });

      await variables.init();
      res.json(variable);
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
      await prisma.variables.delete({ where: { id: Number(req.body.id) } });

      await variables.init();
      res.send('Ok');
    } catch (e) {
      next(e);
    }
  },
);

export default router;
