import { execSync } from 'node:child_process';

function init(args) {
  const projectName = args[0] || 'my-piaman-app';

  console.log(`Initializing Piaman-NX project: ${projectName}`);

  try {
    execSync(`npx create-piaman-nx ${projectName}`, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Failed to initialize project:', error.message);
    process.exit(1);
  }
}

export { init };
