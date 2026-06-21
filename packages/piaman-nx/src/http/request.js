class Request {
  constructor(incomingMessage, params = {}) {
    this._raw = incomingMessage;
    this.params = params;
    this.query = {};
    this.body = null;
    this.method = incomingMessage.method || 'GET';
    this.path = '';
    this.headers = incomingMessage.headers || {};
    this.ip = incomingMessage.socket?.remoteAddress || '';

    this._parseUrl();
  }

  _parseUrl() {
    const url = this._raw.url || '/';
    const [pathname, queryString] = url.split('?');
    this.path = pathname;

    if (queryString) {
      this.query = Object.fromEntries(
        new URLSearchParams(queryString).entries()
      );
    }
  }

  async parseBody() {
    const contentType = this.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      this.body = await this._readJsonBody();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      this.body = await this._readFormBody();
    } else {
      this.body = await this._readRawBody();
    }

    return this.body;
  }

  _readRawBody() {
    return new Promise((resolve) => {
      let data = '';
      this._raw.on('data', (chunk) => { data += chunk; });
      this._raw.on('end', () => { resolve(data); });
    });
  }

  async _readJsonBody() {
    const raw = await this._readRawBody();
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  async _readFormBody() {
    const raw = await this._readRawBody();
    return Object.fromEntries(new URLSearchParams(raw).entries());
  }

  header(name) {
    return this.headers[name.toLowerCase()];
  }
}

export { Request };
export default Request;
