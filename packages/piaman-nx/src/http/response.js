import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const EXTENSION_CONTENT_TYPES = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

function inferContentType(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf('.'));
  return EXTENSION_CONTENT_TYPES[ext] || 'application/octet-stream';
}

class Response {
  constructor(serverResponse, viewsDir = './views') {
    const ctx = {
      _res: serverResponse,
      _statusCode: 200,
      _headers: {},
      _viewsDir: viewsDir,
      _sent: false,
    };

    function callable(statusCode, data) {
      if (ctx._sent) return callable;
      ctx._statusCode = statusCode ?? ctx._statusCode;
      const headers = { ...ctx._headers, 'Content-Type': 'application/json' };
      ctx._res.writeHead(ctx._statusCode, headers);
      ctx._res.end(JSON.stringify(data));
      ctx._sent = true;
      return callable;
    }

    callable.status = (code) => {
      ctx._statusCode = code;
      return callable;
    };

    callable.json = (data) => {
      callable(ctx._statusCode, data);
      return callable;
    };

    callable.views = (filePath) => {
      if (ctx._sent) return callable;
      const fullPath = resolve(ctx._viewsDir, filePath);
      try {
        const content = readFileSync(fullPath);
        const contentType = inferContentType(filePath);
        const headers = { ...ctx._headers, 'Content-Type': contentType };
        ctx._res.writeHead(ctx._statusCode, headers);
        ctx._res.end(content);
        ctx._sent = true;
      } catch {
        const headers = { ...ctx._headers, 'Content-Type': 'application/json' };
        ctx._res.writeHead(404, headers);
        ctx._res.end(JSON.stringify({ error: 'View not found', path: filePath }));
        ctx._sent = true;
      }
      return callable;
    };

    callable.redirect = (url) => {
      if (ctx._sent) return callable;
      ctx._res.writeHead(302, { ...ctx._headers, Location: url });
      ctx._res.end();
      ctx._sent = true;
      return callable;
    };

    callable.setHeader = (key, value) => {
      ctx._headers[key] = value;
      return callable;
    };

    callable.getStatusCode = () => ctx._statusCode;
    callable.isSent = () => ctx._sent;

    Object.setPrototypeOf(callable, Response.prototype);
    return callable;
  }
}

export { Response };
export default Response;
