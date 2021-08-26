import authorization from '@src/bot/systems/authorization';
import { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['x-twitch-token'] as string | undefined;

    if (token) {
      req.user = authorization.verify(token) as any;
    }
  } catch (error) {
    req.user = null;
  } finally {
    next();
  }
};
