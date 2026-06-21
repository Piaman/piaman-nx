#!/usr/bin/env node

import { cpSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const TEMPLATE_DIR = resolve(import.meta.dirname, '..', 'template');
const CORE_PKG_PATH = resolve(import.meta.dirname, '..', '..', 'piaman-nx', 'package.json');

function create(projectName, targetDir) {
  const dest = targetDir || join(process.cwd(), projectName);

  if (existsSync(dest)) {
    console.error(`Directory already exists: ${dest}`);
    process.exit(1);
  }

  mkdirSync(dest, { recursive: true });

  // Copy template structure
  cpSync(TEMPLATE_DIR, dest, { recursive: true });

  // Read core package version for dynamic dependency resolution
  const corePkg = JSON.parse(readFileSync(CORE_PKG_PATH, 'utf-8'));

  // Write project-specific package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    scripts: {
      start: 'node server.js',
      dev: 'node --watch server.js',
    },
    dependencies: {
      '@piaman/piaman-nx': `^${corePkg.version}`
    },
  };

  writeFileSync(join(dest, 'package.json'), JSON.stringify(packageJson, null, 2));

  console.log(`Piaman-NX project "${projectName}" created at ${dest}`);
  console.log('\nNext steps:');
  console.log(`  cd ${projectName}`);
  console.log('  npm install');
  console.log('  npm start');
}

const args = process.argv.slice(2);
const projectName = args[0] || 'my-piaman-app';
const targetDir = args[1] || undefined;

create(projectName, targetDir);
