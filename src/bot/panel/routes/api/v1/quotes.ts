import { Quotes } from '@prisma/client';
import cache from '@src/bot/libs/cache';
import { prisma } from '@src/bot/libs/db';
import isAdmin from '@src/bot/panel/middlewares/isAdmin';
import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';

const router = Router({ mergeParams: true });

router.get('/', (req: Request, res) => {
  res.send([...cache.quotes.values()]);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  const quote = cache.quotes.get(id);

  if (!quote) {
    return res.status(404).send(`Quote with id ${id} not found.`);
  }

  res.status(201).send(quote);
});

router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
  
    const query = { id: Number(id) };
    const quote = await prisma.quotes.findFirst({ where: query });
  
    if (!quote) {
      return res.status(404).send(`Quote with id ${id} not found.`);
    }
  
    await prisma.quotes.delete({ where: query });
  
    res.status(201).send('Ok');
  } catch (error) {
    next(error);
  }
});

router.post('/', 
  isAdmin,
  checkSchema({
    text: {
      isString: true,
      in: ['body'],
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();
      const query = req.body as Partial<Quotes>;
      const authorId = Number(req.user?.userId);

      let quote: Quotes = null;

      if (!query?.id) {
        quote = await prisma.quotes.create({
          data: {
            text: query.text,
            authorId,
          },
        });
      } else {
        quote = await prisma.quotes.update({
          where: {
            id: query.id,
          },
          data: {
            text: query.text,
          },
        });
      }
      await cache.updateQuotes();
      res.status(201).send(quote);
    } catch (error) {
      next(error);
    }
  }
);

export default router;