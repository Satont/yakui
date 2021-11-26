import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';

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
          ${body.byUsername ? `where "user"."username" like '%${body.byUsername}%'` : ''}
          group by
            "user"."id"
          order by
            "${body.sortBy}" ${JSON.parse(body.sortDesc) ? 'DESC' : 'ASC'} NULLS LAST
          limit
            ${body.perPage || 30}
          offset ${(body.page - 1) * body.perPage || 0}
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

      await prisma.users.delete({ where: { id: Number(req.params.id) } });
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
      const user = await prisma.users.findFirst({
        where: { id: req.body.user.id },
        include: {
          bits: true,
          tips: true,
        },
      });

      if (!user) throw new Error('User not found');
      for (const bodyBit of req.body.user.bits) {
        const data = {
          ...bodyBit,
          amount: BigInt(bodyBit.amount),
          timestamp: BigInt(bodyBit.timestamp),
        };
        if (bodyBit.id) {
          await prisma.usersBits.update({
            where: { id: bodyBit.id },
            data,
          });
        } else {
          await prisma.usersBits.create({
            data,
          });
        }
      }

      for (const id of req.body.delete.bits) {
        await prisma.usersBits.delete({ where: { id } }).catch(() => null);
      }

      for (const id of req.body.delete.tips) {
        await prisma.usersTips.delete({ where: { id } }).catch(() => null);
      }

      for (let bodyTip of req.body.user.tips) {
        bodyTip = {
          ...bodyTip,
          timestamp: BigInt(bodyTip.timestamp),
          inMainCurrencyAmount: currency.exchange({ amount: bodyTip.amount, from: bodyTip.currency }),
          rates: currency.rates,
          amount: Number(bodyTip.amount),
        };

        if (bodyTip.id) {
          await prisma.usersTips.update({
            where: { id: bodyTip.id },
            data: bodyTip,
          });
        } else {
          await prisma.usersTips.create({
            data: bodyTip,
          });
        }
      }

      delete req.body.user.bits;
      delete req.body.user.tips;

      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: req.body.user,
      });

      res.send('Ok');
    } catch (e) {
      next(e);
    }
  },
);

export default router;
