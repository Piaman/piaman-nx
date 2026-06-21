import { execSync } from 'node:child_process';
import { join } from 'node:path';

function init(args) {
  const projectName = args[0] || 'my-piaman-app';

  console.log(`Initializing Piaman-NX project: ${projectName}`);

  try {
    execSync(`node ${join(import.meta.dirname, '..', '..', 'create-piaman-nx', 'src', 'create.js')} ${projectName}`, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Failed to initialize project:', error.message);
    process.exit(1);
  }
}

export { init };
