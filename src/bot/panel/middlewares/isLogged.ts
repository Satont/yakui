import { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-twitch-token'] as string | undefined
  if (!token) return res.status(401).send({ code: 401, message: 'You are not logged in.' })
  next()
}
