import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import tmi from '@bot/libs/tmi';

const router = Router();

router.post('/bot', isAdmin, checkSchema({
  message: {
    isString: true,
    in: ['body'],
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw();
    await tmi.say({ type: 'bot', message: req.body.message });

    res.send('Ok');
  } catch (e) {
    next(e);
  }
});

router.post('/broadcaster', isAdmin, checkSchema({
  message: {
    isString: true,
    in: ['body'],
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw();

    await tmi.say({ type: 'broadcaster', message: req.body.message });

    res.send('Ok');
  } catch (e) {
    next(e);
  }
});

export default router;
