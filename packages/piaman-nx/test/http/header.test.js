import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HeaderConstants, parseHeaders, isJsonContentType } from '../../src/http/header.js';

describe('HeaderConstants', () => {
  it('contains common header names', () => {
    assert.equal(HeaderConstants.CONTENT_TYPE, 'content-type');
    assert.equal(HeaderConstants.AUTHORIZATION, 'authorization');
    assert.equal(HeaderConstants.ACCEPT, 'accept');
    assert.equal(HeaderConstants.USER_AGENT, 'user-agent');
    assert.equal(HeaderConstants.LOCATION, 'location');
  });
});

describe('parseHeaders', () => {
  it('converts raw header pairs to object', () => {
    const raw = ['Content-Type', 'application/json', 'Authorization', 'Bearer xyz'];
    const headers = parseHeaders(raw);
    assert.equal(headers['content-type'], 'application/json');
    assert.equal(headers['authorization'], 'Bearer xyz');
  });

  it('returns empty object for empty array', () => {
    const headers = parseHeaders([]);
    assert.deepEqual(headers, {});
  });
});

describe('isJsonContentType', () => {
  it('returns true for application/json', () => {
    assert.ok(isJsonContentType({ 'content-type': 'application/json' }));
  });

  it('returns true for charset variant', () => {
    assert.ok(isJsonContentType({ 'content-type': 'application/json; charset=utf-8' }));
  });

  it('returns false for non-JSON content type', () => {
    assert.ok(!isJsonContentType({ 'content-type': 'text/html' }));
  });

  it('returns false for missing content-type', () => {
    assert.ok(!isJsonContentType({}));
  });
});
