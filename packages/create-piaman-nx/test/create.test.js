import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const TEST_DIR = join(process.cwd(), 'test-scaffold-output');

describe('create-piaman-nx scaffold', () => {
  after(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });

  it('creates project directory with all template files', () => {
    const createScript = join(process.cwd(), 'packages', 'create-piaman-nx', 'src', 'create.js');
    execSync(`node ${createScript} test-app ${TEST_DIR}`, { cwd: process.cwd() });

    // Check directory structure
    assert.ok(existsSync(TEST_DIR));
    assert.ok(existsSync(join(TEST_DIR, 'server.js')));
    assert.ok(existsSync(join(TEST_DIR, 'config', 'app.js')));
    assert.ok(existsSync(join(TEST_DIR, 'config', 'filesystem.js')));
    assert.ok(existsSync(join(TEST_DIR, 'config', 'provider.js')));
    assert.ok(existsSync(join(TEST_DIR, 'modules', 'example', 'example.handler.js')));
    assert.ok(existsSync(join(TEST_DIR, 'routes', 'example', 'example.routes.js')));
    assert.ok(existsSync(join(TEST_DIR, 'views', 'index.html')));
    assert.ok(existsSync(join(TEST_DIR, 'storage', 'logs')));
    assert.ok(existsSync(join(TEST_DIR, '.env.example')));
    assert.ok(existsSync(join(TEST_DIR, 'piaman.config.js')));
    assert.ok(existsSync(join(TEST_DIR, 'js.config.json')));
    assert.ok(existsSync(join(TEST_DIR, 'package.json')));
  });

  it('writes correct package.json with project name', () => {
    const pkg = JSON.parse(readFileSync(join(TEST_DIR, 'package.json'), 'utf-8'));
    assert.equal(pkg.name, 'test-app');
    assert.equal(pkg.type, 'module');
    assert.ok(pkg.dependencies['piaman-nx']);
    assert.ok(pkg.scripts.start);
    assert.ok(pkg.scripts.dev);
  });

  it('server.js contains framework imports', () => {
    const content = readFileSync(join(TEST_DIR, 'server.js'), 'utf-8');
    assert.ok(content.includes('piaman-nx/http'));
    assert.ok(content.includes('piaman-nx/logger'));
    assert.ok(content.includes('piaman.config.js'));
  });

  it('piaman.config.js has port and viewsDir', () => {
    const content = readFileSync(join(TEST_DIR, 'piaman.config.js'), 'utf-8');
    assert.ok(content.includes('port'));
    assert.ok(content.includes('viewsDir'));
  });
});
