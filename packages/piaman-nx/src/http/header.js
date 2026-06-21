const HeaderConstants = {
  CONTENT_TYPE: 'content-type',
  CONTENT_LENGTH: 'content-length',
  AUTHORIZATION: 'authorization',
  ACCEPT: 'accept',
  USER_AGENT: 'user-agent',
  HOST: 'host',
  COOKIE: 'cookie',
  SET_COOKIE: 'set-cookie',
  LOCATION: 'location',
  CACHE_CONTROL: 'cache-control',
  X_REQUESTED_WITH: 'x-requested-with',
};

function parseHeaders(rawHeaders) {
  const headers = {};
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const key = rawHeaders[i].toLowerCase();
    const value = rawHeaders[i + 1];
    headers[key] = value;
  }
  return headers;
}

function isJsonContentType(headers) {
  const ct = headers['content-type'] || '';
  return ct.includes('application/json');
}

export { HeaderConstants, parseHeaders, isJsonContentType };
