import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Request } from '../../src/http/request.js';

function createMockIncomingMessage(options = {}) {
  return {
    method: options.method || 'GET',
    url: options.url || '/',
    headers: options.headers || {},
    socket: { remoteAddress: options.ip || '127.0.0.1' },
    on(event, callback) {
      if (event === 'data') {
        if (options.body) callback(Buffer.from(options.body));
      }
      if (event === 'end') callback();
    },
  };
}

describe('Request', () => {
  it('parses method and path', () => {
    const req = new Request(createMockIncomingMessage({ method: 'POST', url: '/api/users' }));
    assert.equal(req.method, 'POST');
    assert.equal(req.path, '/api/users');
  });

  it('parses query string', () => {
    const req = new Request(createMockIncomingMessage({ url: '/search?q=hello&page=2' }));
    assert.equal(req.query.q, 'hello');
    assert.equal(req.query.page, '2');
  });

  it('returns empty query when no query string', () => {
    const req = new Request(createMockIncomingMessage({ url: '/simple' }));
    assert.deepEqual(req.query, {});
  });

  it('exposes headers', () => {
    const req = new Request(createMockIncomingMessage({
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer xyz' },
    }));
    assert.equal(req.headers['content-type'], 'application/json');
  });

  it('header() method returns specific header', () => {
    const req = new Request(createMockIncomingMessage({
      headers: { 'x-custom': 'value' },
    }));
    assert.equal(req.header('x-custom'), 'value');
  });

  it('extracts ip', () => {
    const req = new Request(createMockIncomingMessage({ ip: '10.0.0.1' }));
    assert.equal(req.ip, '10.0.0.1');
  });

  it('defaults path to / when url is /', () => {
    const req = new Request(createMockIncomingMessage({ url: '/' }));
    assert.equal(req.path, '/');
  });

  it('parseBody parses JSON body', async () => {
    const req = new Request(createMockIncomingMessage({
      method: 'POST',
      url: '/api',
      headers: { 'content-type': 'application/json' },
      body: '{"name":"test"}',
    }));
    const body = await req.parseBody();
    assert.deepEqual(body, { name: 'test' });
  });

  it('parseBody parses form-urlencoded body', async () => {
    const req = new Request(createMockIncomingMessage({
      method: 'POST',
      url: '/form',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=admin&password=secret',
    }));
    const body = await req.parseBody();
    assert.equal(body.username, 'admin');
    assert.equal(body.password, 'secret');
  });

  it('accepts params from constructor', () => {
    const req = new Request(createMockIncomingMessage(), { id: '42' });
    assert.equal(req.params.id, '42');
  });
});
