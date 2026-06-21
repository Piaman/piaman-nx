import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const LEVELS = {
  error: { tag: 'ERROR', color: '\x1b[31m' },
  warn: { tag: 'WARN', color: '\x1b[33m' },
  info: { tag: 'INFO', color: '\x1b[36m' },
  debug: { tag: 'DEBUG', color: '\x1b[90m' },
};

class Logger {
  constructor(options = {}) {
    this._filePath = resolve(options.filePath || './storage/logs');
    this._console = options.console !== false;
    this._level = options.level || 'debug';
  }

  _formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    const { tag, color } = LEVELS[level];
    return { timestamp, tag, color, text: `[${timestamp}] [${tag}] ${message}` };
  }

  _writeToFile(level, message) {
    const date = new Date().toISOString().split('T')[0];
    const logDir = join(this._filePath, date);

    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    const logFile = join(logDir, 'global.log');
    const formatted = this._formatMessage(level, message);
    appendFileSync(logFile, formatted.text + '\n');
  }

  _shouldLog(level) {
    const levelOrder = ['error', 'warn', 'info', 'debug'];
    const currentIdx = levelOrder.indexOf(this._level);
    const msgIdx = levelOrder.indexOf(level);
    return msgIdx <= currentIdx;
  }

  _log(level, message) {
    if (!this._shouldLog(level)) return;

    const formatted = this._formatMessage(level, message);

    if (this._console) {
      const reset = '\x1b[0m';
      console.log(`${formatted.color}${formatted.text}${reset}`);
    }

    this._writeToFile(level, message);
  }

  error(message) { this._log('error', message); }
  warn(message) { this._log('warn', message); }
  info(message) { this._log('info', message); }
  debug(message) { this._log('debug', message); }
}

const logger = new Logger();

export { Logger, logger };
export default logger;
