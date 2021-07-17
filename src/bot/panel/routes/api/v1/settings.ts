import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import { loadedSystems } from '@bot/libs/loader';
import { prisma } from '@bot/libs/db';

const router = Router({
  mergeParams: true,
});

router.get(
  '/',
  isAdmin,
  checkSchema({
    space: {
      isString: true,
      in: ['query'],
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();
      const space = req.query.space as string;
      const settings = await prisma.settings.findMany({ where: { space } });

      res.send(settings);
    } catch (e) {
      next(e);
    }
  },
);

router.post('/', isAdmin, async (req, res, next) => {
  const body: { space: string; name: string; value: any }[] = req.body;
  try {
    for (const data of body) {
      const module = loadedSystems.find((s) => s.constructor.name.toLowerCase() === data.space);
      if (!module) continue;
      module[data.name] = data.value;
    }
    res.send('Ok');
  } catch (e) {
    next(e);
  }
});

export default router;
