#!/usr/bin/env node

import { serve } from './commands/serve.js';
import { make } from './commands/make.js';
import { init } from './commands/init.js';

const args = process.argv.slice(2);
const command = args[0];
const subArgs = args.slice(1);

const commands = {
  serve: () => serve(subArgs),
  make: () => make(subArgs),
  init: () => init(subArgs),
};

if (!command || !commands[command]) {
  console.log('Piaman CLI — Available commands:');
  console.log('  piaman serve [--port <port>] [--host <host>]   Start the development server');
  console.log('  piaman make:handler <name>                     Generate a handler file');
  console.log('  piaman make:route <name>                       Generate a route file');
  console.log('  piaman make:module <name>                      Generate handler + route');
  console.log('  piaman init                                    Scaffold a new project');
  process.exit(0);
}

commands[command]();
