import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Router, pathToRegex, extractParams } from '../../src/http/router.js';

describe('Router', () => {
  it('registers a GET route', () => {
    const router = new Router();
    const handler = () => {};
    router.get('/hello', handler);
    const routes = router.getRoutes();
    assert.equal(routes.length, 1);
    assert.equal(routes[0].method, 'GET');
    assert.equal(routes[0].pattern, '/hello');
  });

  it('matches a static GET path', () => {
    const router = new Router();
    router.get('/hello', () => 'matched');
    const result = router.match('GET', '/hello');
    assert.ok(result);
    assert.equal(result.handler(), 'matched');
  });

  it('returns null for unmatched path', () => {
    const router = new Router();
    router.get('/hello', () => {});
    const result = router.match('GET', '/unknown');
    assert.equal(result, null);
  });

  it('matches method correctly', () => {
    const router = new Router();
    router.get('/items', () => 'get');
    router.post('/items', () => 'post');
    assert.equal(router.match('GET', '/items').handler(), 'get');
    assert.equal(router.match('POST', '/items').handler(), 'post');
  });

  it('extracts path params', () => {
    const router = new Router();
    router.get('/users/:id', (req, res) => {});
    const result = router.match('GET', '/users/42');
    assert.ok(result);
    assert.equal(result.params.id, '42');
  });

  it('extracts multiple params', () => {
    const router = new Router();
    router.get('/users/:userId/posts/:postId', () => {});
    const result = router.match('GET', '/users/5/posts/99');
    assert.ok(result);
    assert.equal(result.params.userId, '5');
    assert.equal(result.params.postId, '99');
  });

  it('handles wildcard routes', () => {
    const router = new Router();
    router.get('/files/*', () => 'wild');
    const result = router.match('GET', '/files/docs/readme.txt');
    assert.ok(result);
    assert.equal(result.params['*'], 'docs/readme.txt');
  });

  it('groups routes under prefix', () => {
    const apiRouter = new Router();
    apiRouter.get('/users', () => 'users');
    apiRouter.get('/posts', () => 'posts');

    const mainRouter = new Router();
    mainRouter.group('/api', apiRouter);

    assert.equal(mainRouter.match('GET', '/api/users').handler(), 'users');
    assert.equal(mainRouter.match('GET', '/api/posts').handler(), 'posts');
  });

  it('registers all HTTP methods', () => {
    const router = new Router();
    const handler = () => {};
    router.get('/r', handler);
    router.post('/r', handler);
    router.put('/r', handler);
    router.delete('/r', handler);
    router.patch('/r', handler);
    assert.equal(router.getRoutes().length, 5);
  });
});

describe('pathToRegex', () => {
  it('converts static path to regex', () => {
    const regex = pathToRegex('/hello');
    assert.ok(regex.test('/hello'));
    assert.ok(!regex.test('/hello/world'));
  });

  it('converts param path to regex', () => {
    const regex = pathToRegex('/users/:id');
    assert.ok(regex.test('/users/42'));
    assert.ok(!regex.test('/users'));
  });

  it('converts wildcard path to regex', () => {
    const regex = pathToRegex('/files/*');
    assert.ok(regex.test('/files/a/b/c'));
    assert.ok(!regex.test('/other/a'));
  });
});

describe('extractParams', () => {
  it('extracts named param', () => {
    const params = extractParams('/users/:id', '/users/42');
    assert.equal(params.id, '42');
  });

  it('extracts wildcard remainder', () => {
    const params = extractParams('/files/*', '/files/docs/readme.txt');
    assert.equal(params['*'], 'docs/readme.txt');
  });
});
