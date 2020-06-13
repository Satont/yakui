import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import Authorization from '@bot/systems/authorization'

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-twitch-token'] as string | undefined
  const JWTToken = req.headers['x-jwt-token'] as string | undefined

  if (!token && !JWTToken) return res.status(401).send()
  try {
    if (token) {
      const user = jwt.verify(token, Authorization.JWTKey) as { userId: number, username: string, privileges: string }
      if (!user || user.privileges !== 'admin') return res.status(401).send()
    }
    if (JWTToken) {
      const verify = JWTToken === Authorization.JWTKey
      if (!verify) return res.status(401).send()
    }
  } catch (error) {
    console.error(error)
    return res.status(401).send()
  }

  next()
}
