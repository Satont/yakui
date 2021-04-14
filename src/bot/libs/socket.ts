import { server } from '@bot/panel/index';
import io from 'socket.io';
import authorization from '@bot/systems/authorization';
import { debug } from './logger';

const socket = new io.Server().attach(server);

export default socket;

export const getNameSpace = (space: string, { isPublic = true }: { isPublic?: boolean } = {}) => {
  const namespace = socket.of(space);
  namespace.use((request, next) => {
    if (!isPublic) {
      const token = (request.handshake.query as any).token as string;
      if (authorization.verify(token)) next();

      next(new Error('Unauthorized.'));
    } else {
      next();
    }
  });

  debug('socket', `namespace ${namespace.name} successfuly created.`);
  return namespace;
};
