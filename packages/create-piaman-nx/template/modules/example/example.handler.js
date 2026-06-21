import { logger } from '@piaman/piaman-nx/logger';

export const healthHandler = {
  health(req, res) {
    res(200, { status: 'ok', timestamp: new Date().toISOString() });
  },

  logs(req, res) {
    res(200, { message: 'Log endpoint active', level: 'info' });
  },
};

export default healthHandler;
