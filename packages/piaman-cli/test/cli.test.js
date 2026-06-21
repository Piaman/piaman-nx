import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseServeArgs } from '../src/commands/serve.js';
import { makeHandler, makeRoute, makeModule } from '../src/commands/make.js';

const TEST_GEN_DIR = join(process.cwd(), 'test-cli-gen');

describe('CLI arg parsing', () => {
  it('parseServeArgs extracts --port', () => {
    const result = parseServeArgs(['--port', '4000']);
    assert.equal(result.port, '4000');
  });

  it('parseServeArgs extracts --host', () => {
    const result = parseServeArgs(['--host', '0.0.0.0']);
    assert.equal(result.host, '0.0.0.0');
  });

  it('parseServeArgs handles both flags', () => {
    const result = parseServeArgs(['--port', '8080', '--host', '127.0.0.1']);
    assert.equal(result.port, '8080');
    assert.equal(result.host, '127.0.0.1');
  });

  it('parseServeArgs defaults to null', () => {
    const result = parseServeArgs([]);
    assert.equal(result.port, null);
    assert.equal(result.host, null);
  });
});

describe('CLI make commands', () => {
  after(() => {
    if (existsSync(TEST_GEN_DIR)) rmSync(TEST_GEN_DIR, { recursive: true });
  });

  it('makeHandler creates handler file', () => {
    makeHandler('user', TEST_GEN_DIR);
    const filePath = join(TEST_GEN_DIR, 'modules', 'user', 'user.handler.js');
    assert.ok(existsSync(filePath));
    const content = readFileSync(filePath, 'utf-8');
    assert.ok(content.includes('userHandler'));
    assert.ok(content.includes('@piaman/piaman-nx/logger'));
  });

  it('makeRoute creates route file', () => {
    makeRoute('user', TEST_GEN_DIR);
    const filePath = join(TEST_GEN_DIR, 'routes', 'user', 'user.routes.js');
    assert.ok(existsSync(filePath));
    const content = readFileSync(filePath, 'utf-8');
    assert.ok(content.includes('Router'));
    assert.ok(content.includes('@piaman/piaman-nx/http'));
    assert.ok(content.includes('userHandler'));
  });

  it('makeModule creates both handler and route', () => {
    makeModule('product', TEST_GEN_DIR);
    const handlerPath = join(TEST_GEN_DIR, 'modules', 'product', 'product.handler.js');
    const routePath = join(TEST_GEN_DIR, 'routes', 'product', 'product.routes.js');
    assert.ok(existsSync(handlerPath));
    assert.ok(existsSync(routePath));
  });
});
