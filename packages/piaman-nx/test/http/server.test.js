import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Http } from '../../src/http/server.js';
import { Router } from '../../src/http/router.js';

describe('Http server', () => {
  it('creates an Http instance with default options', () => {
    const app = new Http();
    assert.ok(app);
  });

  it('creates an Http instance with custom options', () => {
    const app = new Http({ port: 4000, viewsDir: './custom-views' });
    assert.ok(app);
  });

  it('registers routes', () => {
    const app = new Http();
    app.get('/test', () => {});
    app.post('/test', () => {});
    assert.equal(app._router.getRoutes().length, 2);
  });

  it('mounts a router via use()', () => {
    const subRouter = new Router();
    subRouter.get('/sub', () => 'sub-handler');
    const app = new Http();
    app.use(subRouter);
    assert.equal(app._router.getRoutes().length, 1);
  });
});
