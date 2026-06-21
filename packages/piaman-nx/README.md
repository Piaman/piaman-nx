# Piaman-NX

> **Piaman Next Generation** — A modern, lightweight, and blazing-fast JavaScript backend framework inspired by the energy and cultural heritage of Pariaman, Indonesia.

Piaman-NX is built from the ground up to provide a modular, developer-friendly experience for building scalable Node.js applications. It embraces modern JavaScript features like native ECMAScript Modules (ESM) and the built-in Node.js test runner, eliminating unnecessary dependencies to keep your production footprint incredibly small.

[![npm version](https://img.shields.io/npm/v/@piaman/piaman-nx.svg)](https://www.npmjs.com/package/@piaman/piaman-nx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Monorepo Ecosystem

Piaman-NX is managed as a monorepo consisting of three core packages:

- **[`@piaman/piaman-nx`](./packages/piaman-nx)**: The core HTTP server, routing engine, and logger.
- **[`@piaman/piaman-cli`](./packages/piaman-cli)**: The command-line interface to scaffolding and serve your application.
- **[`@piaman/create-piaman-nx`](./packages/create-piaman-nx)**: The official initializer tool for scaffolding new projects in seconds.

---

## Quick Start

The fastest way to get started with Piaman-NX is by generating a new project using `npm create`.

```bash
# Initialize a new Piaman-NX project
npm create piaman-nx@latest my-awesome-app

# Navigate into your project directory
cd my-awesome-app

# Install dependencies
npm install

# Start the development server
npm run dev
```
