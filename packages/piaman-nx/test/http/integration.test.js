import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { Http } from '../../src/http/server.js';
import { Router } from '../../src/http/router.js';

async function fetchJson(port, path, options = {}) {
  const url = `http://localhost:${port}${path}`;
  const res = await fetch(url, options);
  return { status: res.status, body: await res.json(), headers: res.headers };
}

describe('Integration: full server roundtrip', () => {
  const PORT = 9876;
  let app;
  let server;

  it('starts server and handles requests', async () => {
    app = new Http({ port: PORT, viewsDir: './views' });

    app.get('/', (req, res) => {
      res(200, { status: 'ok', message: 'welcome' });
    });

    app.get('/users/:id', (req, res) => {
      res(200, { id: req.params.id });
    });

    app.get('/search', (req, res) => {
      res(200, { q: req.query.q });
    });

    app.post('/data', (req, res) => {
      res(201, { received: req.body });
    });

    app.get('/redirect-me', (req, res) => {
      res.redirect('/target');
    });

    const subRouter = new Router();
    subRouter.get('/sub', (req, res) => {
      res(200, { sub: true });
    });
    app.use(subRouter);

    server = app.listen(PORT);

    // Test simple GET
    const home = await fetchJson(PORT, '/');
    assert.equal(home.status, 200);
    assert.equal(home.body.status, 'ok');
    assert.equal(home.body.message, 'welcome');

    // Test params
    const user = await fetchJson(PORT, '/users/42');
    assert.equal(user.status, 200);
    assert.equal(user.body.id, '42');

    // Test query
    const search = await fetchJson(PORT, '/search?q=hello');
    assert.equal(search.status, 200);
    assert.equal(search.body.q, 'hello');

    // Test POST with body
    const postRes = await fetchJson(PORT, '/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test' }),
    });
    assert.equal(postRes.status, 201);
    assert.equal(postRes.body.received.name, 'test');

    // Test redirect
    const redirectRes = await fetch(`http://localhost:${PORT}/redirect-me`, { redirect: 'manual' });
    assert.equal(redirectRes.status, 302);

    // Test router mounting
    const sub = await fetchJson(PORT, '/sub');
    assert.equal(sub.status, 200);
    assert.equal(sub.body.sub, true);

    // Test 404
    const notFound = await fetchJson(PORT, '/nonexistent');
    assert.equal(notFound.status, 404);
    assert.equal(notFound.body.error, 'Not Found');
  });

  after(() => {
    if (server) server.close();
  });
});
