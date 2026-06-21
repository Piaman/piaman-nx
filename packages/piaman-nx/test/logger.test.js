import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Logger } from '../src/logger.js';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const TEST_LOG_DIR = join(process.cwd(), 'test-logs');

describe('Logger', () => {
  let logger;

  beforeEach(() => {
    // Clean up test log dir
    if (existsSync(TEST_LOG_DIR)) rmSync(TEST_LOG_DIR, { recursive: true });
    logger = new Logger({ filePath: TEST_LOG_DIR, console: false, level: 'debug' });
  });

  it('creates log directory and file', () => {
    logger.info('test message');
    const date = new Date().toISOString().split('T')[0];
    const logFile = join(TEST_LOG_DIR, date, 'global.log');
    assert.ok(existsSync(logFile));
  });

  it('writes info message to file', () => {
    logger.info('hello info');
    const date = new Date().toISOString().split('T')[0];
    const logFile = join(TEST_LOG_DIR, date, 'global.log');
    const content = readFileSync(logFile, 'utf-8');
    assert.ok(content.includes('[INFO]'));
    assert.ok(content.includes('hello info'));
  });

  it('writes error message to file', () => {
    logger.error('something broke');
    const date = new Date().toISOString().split('T')[0];
    const logFile = join(TEST_LOG_DIR, date, 'global.log');
    const content = readFileSync(logFile, 'utf-8');
    assert.ok(content.includes('[ERROR]'));
    assert.ok(content.includes('something broke'));
  });

  it('respects level filtering', () => {
    const warnLogger = new Logger({ filePath: TEST_LOG_DIR, console: false, level: 'warn' });
    warnLogger.info('should not appear');
    warnLogger.warn('should appear');
    warnLogger.error('should also appear');

    const date = new Date().toISOString().split('T')[0];
    const logFile = join(TEST_LOG_DIR, date, 'global.log');
    const content = readFileSync(logFile, 'utf-8');
    assert.ok(!content.includes('[INFO]'));
    assert.ok(content.includes('[WARN]'));
    assert.ok(content.includes('[ERROR]'));
  });
});
