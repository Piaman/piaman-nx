import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Response } from '../../src/http/response.js';

function createMockServerResponse() {
  const chunks = [];
  let statusCode = 200;
  const headers = {};

  return {
    writeHead(code, hdrs) {
      statusCode = code;
      Object.assign(headers, hdrs);
    },
    end(data) {
      chunks.push(data);
    },
    _getStatusCode() { return statusCode; },
    _getHeaders() { return headers; },
    _getBody() { return chunks.join(''); },
  };
}

describe('Response', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = createMockServerResponse();
  });

  it('callable: res(200, data) sends JSON', () => {
    const res = new Response(mockRes);
    res(200, { status: 'ok' });

    assert.equal(mockRes._getStatusCode(), 200);
    assert.equal(mockRes._getHeaders()['Content-Type'], 'application/json');
    assert.equal(mockRes._getBody(), '{"status":"ok"}');
  });

  it('callable: res(404, error) sends error JSON', () => {
    const res = new Response(mockRes);
    res(404, { error: 'Not Found' });

    assert.equal(mockRes._getStatusCode(), 404);
    assert.equal(mockRes._getBody(), '{"error":"Not Found"}');
  });

  it('status().json() chaining', () => {
    const res = new Response(mockRes);
    res.status(201).json({ created: true });

    assert.equal(mockRes._getStatusCode(), 201);
    assert.equal(mockRes._getBody(), '{"created":true}');
  });

  it('setHeader adds custom headers', () => {
    const res = new Response(mockRes);
    res.setHeader('X-Custom', 'value')(200, { ok: true });

    assert.equal(mockRes._getHeaders()['X-Custom'], 'value');
  });

  it('redirect sends 302', () => {
    const res = new Response(mockRes);
    res.redirect('/new-url');

    assert.equal(mockRes._getStatusCode(), 302);
    assert.equal(mockRes._getHeaders()['Location'], '/new-url');
  });

  it('res instanceof Response', () => {
    const res = new Response(mockRes);
    assert.ok(res instanceof Response);
  });

  it('typeof res === function', () => {
    const res = new Response(mockRes);
    assert.equal(typeof res, 'function');
  });

  it('isSent() tracks response state', () => {
    const res = new Response(mockRes);
    assert.equal(res.isSent(), false);
    res(200, {});
    assert.equal(res.isSent(), true);
  });

  it('double-send is prevented', () => {
    const res = new Response(mockRes);
    res(200, { first: true });
    res(200, { second: true }); // should be ignored
    assert.equal(mockRes._getBody(), '{"first":true}');
  });

  it('getStatusCode() returns current status', () => {
    const res = new Response(mockRes);
    res.status(404);
    assert.equal(res.getStatusCode(), 404);
  });
});
