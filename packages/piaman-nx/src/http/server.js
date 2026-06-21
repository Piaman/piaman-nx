import { createServer } from 'node:http';
import { Router } from './router.js';
import { Request } from './request.js';
import { Response } from './response.js';

class Http {
  constructor(options = {}) {
    this._router = new Router();
    this._options = {
      port: options.port || 3000,
      host: options.host || 'localhost',
      viewsDir: options.viewsDir || './views',
    };
    this._server = null;
  }

  get(pattern, handler) { return this._router.get(pattern, handler); }
  post(pattern, handler) { return this._router.post(pattern, handler); }
  put(pattern, handler) { return this._router.put(pattern, handler); }
  delete(pattern, handler) { return this._router.delete(pattern, handler); }
  patch(pattern, handler) { return this._router.patch(pattern, handler); }

  use(router) {
    for (const route of router.getRoutes()) {
      this._router.addRoute(route.method, route.pattern, route.handler);
    }
    return this;
  }

  listen(port, callback) {
    const listenPort = port || this._options.port;

    this._server = createServer(async (incomingMessage, serverResponse) => {
      await this._handleRequest(incomingMessage, serverResponse);
    });

    this._server.listen(listenPort, this._options.host, () => {
      if (callback) callback();
    });

    return this._server;
  }

  close() {
    if (this._server) {
      this._server.close();
      this._server = null;
    }
  }

  async _handleRequest(incomingMessage, serverResponse) {
    const req = new Request(incomingMessage);
    await req.parseBody();

    const match = this._router.match(req.method, req.path);

    if (match) {
      req.params = match.params;
      const res = new Response(serverResponse, this._options.viewsDir);
      try {
        await match.handler(req, res);
      } catch (error) {
        if (!res.isSent()) {
          res(500, { error: 'Internal Server Error', message: error.message });
        }
      }
    } else {
      const res = new Response(serverResponse, this._options.viewsDir);
      res(404, { error: 'Not Found', path: req.path });
    }
  }
}

export { Http };
export default Http;
