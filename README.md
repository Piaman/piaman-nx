# Piaman Next Generation

Modern and simple JavaScript family backend framework.

## Installation

```bash
# Install the core library
npm install piaman-nx

# Create a new project
npm create @piaman-nx latest

# Install the CLI
npm install piaman-cli
```

## Quick Start

```js
import { Http, Response } from 'piaman-nx/http';
import { logger } from 'piaman-nx/logger';
import config from './piaman.js.config';
import healthHandler from './modules/example/example.handler.js';
import exampleRoutes from './routes/example/example.routes.js';

const app = new Http({ viewsDir: config.viewsDir });

app.get('/health', healthHandler.health);
app.get('/health/log', healthHandler.logs);
app.use(exampleRoutes);

app.get('/', (req, res) => {
  res(200, { status: 'ok', message: 'welcome' });
});

app.get('/example', (req, res) => {
  res.views('index.html');
});

app.listen(config.port, () => logger.info(`Piaman-NX running on ${config.host}:${config.port}`));
```

## Project Structure

```
config/
  app.js
  filesystem.js
  provider.js
modules/
  example/
    example.handler.js
routes/
  example/
    example.routes.js
storage/
  logs/
views/
  index.html
.env.example
piaman.js.config
js.config.json
server.js
```

## v1 Scope — HTTP Operations

- **Http** — Server built on Node.js native `http` module
- **Router** — Path matching with params (`:id`), wildcards (`*`), route grouping
- **Request** — Wraps `IncomingMessage`: params, query, body, headers, method, path, ip
- **Response** — Callable + methods: `res(200, data)`, `res.status().json()`, `res.views()`, `res.redirect()`
- **Logger** — Console + file logging with configurable path

## License

MIT
