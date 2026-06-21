const METHODS = ['get', 'post', 'put', 'delete', 'patch'];

function pathToRegex(pattern) {
  const wildcardReplacer = '(.*)';
  const paramReplacer = '([^/]+)';

  const parts = pattern.split('/').filter(Boolean);
  const regexParts = parts.map((part) => {
    if (part === '*') return wildcardReplacer;
    if (part.startsWith(':')) return paramReplacer;
    return part;
  });

  const regexStr = `^/${regexParts.join('/')}$`;
  return new RegExp(regexStr);
}

function extractParams(pattern, path) {
  const parts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  const params = {};

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '*') {
      params['*'] = pathParts.slice(i).join('/');
      break;
    }
    if (parts[i].startsWith(':')) {
      const name = parts[i].slice(1);
      params[name] = pathParts[i];
    }
  }

  return params;
}

class Router {
  constructor() {
    this._routes = [];
  }

  addRoute(method, pattern, handler) {
    const regex = pathToRegex(pattern);
    this._routes.push({ method: method.toUpperCase(), pattern, regex, handler });
    return this;
  }

  get(pattern, handler) { return this.addRoute('GET', pattern, handler); }
  post(pattern, handler) { return this.addRoute('POST', pattern, handler); }
  put(pattern, handler) { return this.addRoute('PUT', pattern, handler); }
  delete(pattern, handler) { return this.addRoute('DELETE', pattern, handler); }
  patch(pattern, handler) { return this.addRoute('PATCH', pattern, handler); }

  group(prefix, router) {
    for (const route of router._routes) {
      const combinedPattern = prefix + route.pattern;
      this.addRoute(route.method, combinedPattern, route.handler);
    }
    return this;
  }

  match(method, path) {
    for (const route of this._routes) {
      if (route.method !== method.toUpperCase()) continue;
      if (!route.regex.test(path)) continue;
      const params = extractParams(route.pattern, path);
      return { handler: route.handler, params };
    }
    return null;
  }

  getRoutes() {
    return [...this._routes];
  }
}

export { Router, pathToRegex, extractParams };
export default Router;
