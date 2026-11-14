// Runs after `npm install` in server/ (postinstall). On Render only, it builds the React app
// into client/dist so the Express server can serve the site, whatever the dashboard's build
// command is. Does nothing on your own computer or on Netlify.
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const client = fileURLToPath(new URL('../../client/', import.meta.url));

if (!process.env.RENDER) process.exit(0);
if (existsSync(new URL('../../client/dist/index.html', import.meta.url))) {
  console.log('[render-build] client/dist already built.');
  process.exit(0);
}

console.log('[render-build] Building the front end in', client);
const run = (cmd) => execSync(cmd, { cwd: client, stdio: 'inherit' });
run('npm ci --include=dev');
run('npm run build');
console.log('[render-build] Front end built.');
