import { HelixPrivilegedUser } from 'twitch';

declare module 'express' {
  interface Request {
    user?: {
      userId: string,
      username: string,
    };
  }
}