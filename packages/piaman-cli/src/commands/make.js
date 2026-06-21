import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HANDLER_TEMPLATE = `import { logger } from '@piaman/piaman-nx/logger';

export const {{name}}Handler = {
  // Define your handler methods here
  index(req, res) {
    res(200, { message: '{{name}} handler' });
  },
};

export default {{name}}Handler;
`;

const ROUTE_TEMPLATE = `import { Router } from '@piaman/piaman-nx/http';
import {{name}}Handler from '../../modules/{{name}}/{{name}}.handler.js';

const router = new Router();

router.get('/{{name}}', {{name}}Handler.index);

export default router;
`;

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function makeHandler(name, cwd) {
  const dir = join(cwd, 'modules', name);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const content = HANDLER_TEMPLATE.replaceAll('{{name}}', name);
  const filePath = join(dir, `${name}.handler.js`);
  writeFileSync(filePath, content);
  console.log(`Handler created: ${filePath}`);
}

function makeRoute(name, cwd) {
  const dir = join(cwd, 'routes', name);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const content = ROUTE_TEMPLATE.replaceAll('{{name}}', name);
  const filePath = join(dir, `${name}.routes.js`);
  writeFileSync(filePath, content);
  console.log(`Route created: ${filePath}`);
}

function makeModule(name, cwd) {
  makeHandler(name, cwd);
  makeRoute(name, cwd);
  console.log(`Module "${name}" created with handler + route.`);
}

function make(args) {
  const cwd = process.cwd();
  const command = args[0];

  if (!command) {
    console.log('Available make commands:');
    console.log('  piaman make:handler <name>   Generate a handler file');
    console.log('  piaman make:route <name>     Generate a route file');
    console.log('  piaman make:module <name>    Generate handler + route');
    process.exit(0);
  }

  const name = args[1];
  if (!name) {
    console.error('Error: name is required');
    process.exit(1);
  }

  switch (command) {
    case 'handler':
      makeHandler(name, cwd);
      break;
    case 'route':
      makeRoute(name, cwd);
      break;
    case 'module':
      makeModule(name, cwd);
      break;
    default:
      console.error(`Unknown make command: ${command}`);
      console.log('Available: make:handler, make:route, make:module');
      process.exit(1);
  }
}

export { make, makeHandler, makeRoute, makeModule };
