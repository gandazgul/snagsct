const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const path = require('path');

const rootFolder = path.resolve('.');
const queueFolder = path.resolve(rootFolder, 'queue');
const buildFolder = path.resolve(queueFolder, 'build');
const queueDistFolder = path.resolve(rootFolder, '_site', 'queue');

fs.removeSync(buildFolder);
fs.removeSync(path.join(rootFolder, '_site'));

execSync('yarn build', { stdio: 'inherit', cwd: queueFolder });

// copy the public assets
fs.copyFileSync(path.join(buildFolder, 'manifest.json'), path.join(rootFolder, 'public', 'manifest.json'));
fs.copyFileSync(path.join(buildFolder, 'icon144.png'), path.join(rootFolder, 'icon144.png'));
fs.copySync(path.join(buildFolder, 'static'), path.join(rootFolder, 'public', 'static'));

// Build with jekyll
execSync('bundle exec jekyll build', { stdio: 'inherit' });

// make a directory for the queue app
fs.mkdirp(queueDistFolder);

// put the service worker in the queue folder
fs.copyFileSync(path.join(buildFolder, 'service-worker.js.LICENSE.txt'), path.join(queueDistFolder, 'service-worker.js.LICENSE.txt'));
fs.copyFileSync(path.join(buildFolder, 'service-worker.js.map'), path.join(queueDistFolder, 'service-worker.js.map'));

const serviceWorkerContents = fs.readFileSync(path.join(buildFolder, 'service-worker.js'), 'utf8');
fs.writeFileSync(path.join(queueDistFolder, 'service-worker.js'), serviceWorkerContents.replace(/\/public\/index\.html/g, '/queue/index.html'));

// copy the index.html
fs.copyFileSync(path.join(buildFolder, 'index.html'), path.join(queueDistFolder, 'index.html'));
