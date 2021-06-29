import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';

import { User } from '@bot/entities/User';
import currency from '@bot/libs/currency';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import { prisma } from '@bot/libs/db';

const router = Router({
  mergeParams: true,
});

router.get(
  '/',
  checkSchema({
    page: {
      isInt: {
        options: {
          gt: 0,
        },
      },
    },
    perPage: {
      isInt: {
        options: {
          gt: 0,
          max: 100,
        },
      },
    },
    sortBy: {
      isString: true,
      isIn: {
        options: [['username', 'messages', 'watched', 'tips', 'bits', 'points']],
      },
    },
    byUsername: {
      isString: true,
      optional: true,
    },
    sortDesc: {
      isBoolean: true,
    },
  }),
  async (req, res, next) => {
    try {
      validationResult(req).throw();

      const body = req.query as any;

      const users = await prisma.$queryRaw`select
      "user".*,
      COALESCE(
        SUM(
          "userTips"."inMainCurrencyAmount"
        ),
        0
      ) as "tips",
      COALESCE(
        SUM("userBits"."amount"),
        0
      ) as "bits"
    from
      "users" as "user"
      left join "users_tips" as "userTips" on "user"."id" = "userTips"."userId"
      left join "users_bits" as "userBits" on "user"."id" = "userBits"."userId"
    where "user"."username" like '%${body.byUsername ?? ''}%'
    group by
      "user"."id"
    order by
      "${body.sortBy}" ${JSON.parse(body.sortDesc) ? 'DESC' : 'ASC'} ASC NULLS LAST
    limit
      ${body.perPage}
    offset ${(body.page - 1) * body.perPage}
        `;
      const total = await prisma.users.count();

      res.json({ users, total });
    } catch (e) {
      next(e);
    }
  },
);

router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.users.findFirst({ where: { id: Number(req.params.id) }, include: { tips: true, bits: true } });

    res.json(user);
  } catch (e) {
    next(e);
  }
});

/* router.delete(
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
      const repository = RequestContext.getEntityManager().getRepository(User);
      const user = await repository.findOne(Number(req.params.id));

      await repository.removeAndFlush(user);
      res.send('Ok');
    } catch (e) {
      next(e);
    }
  },
);

router.post(
  '/',
  isAdmin,
  checkSchema({
    user: {
      in: ['body'],
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();

      const repository = RequestContext.getEntityManager().getRepository(User);
      const bitRepository = RequestContext.getEntityManager().getRepository(UserBit);
      const tipRepository = RequestContext.getEntityManager().getRepository(UserTip);
      const user = await repository.findOne(req.body.user.id, ['bits', 'tips']);

      if (!user) throw new Error('User not found');

      for (const bodyBit of req.body.user.bits) {
        const bit = bodyBit.id ? await bitRepository.findOne(bodyBit.id) : new UserBit();
        bitRepository.assign(bit, { ...bodyBit, user: bodyBit.userId });
        bitRepository.persist(bit);
      }

      for (const id of req.body.delete.bits) {
        bitRepository.remove(await bitRepository.findOne({ id }));
      }

      for (const id of req.body.delete.tips) {
        tipRepository.remove(await tipRepository.findOne({ id }));
      }

      for (let bodyTip of req.body.user.tips) {
        bodyTip = {
          ...bodyTip,
          inMainCurrencyAmount: currency.exchange({ amount: bodyTip.amount, from: bodyTip.currency }),
          rates: currency.rates,
          amount: Number(bodyTip.amount),
        };

        const tip = bodyTip.id ? await tipRepository.findOne(bodyTip.id) : new UserTip();

        tipRepository.assign(tip, bodyTip);
        tipRepository.persist(tip);
      }

      delete req.body.user.bits;
      delete req.body.user.tips;

      wrap(user).assign(req.body.user);

      await bitRepository.flush();
      await tipRepository.flush();
      await repository.flush();

      res.send('Ok');
    } catch (e) {
      next(e);
    }
  },
); */

export default router;
