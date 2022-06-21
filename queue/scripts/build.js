const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const path = require('path');

const rootFolder = path.resolve('.');
const queueFolder = path.resolve(rootFolder, 'queue');
const buildFolder = path.resolve(queueFolder, 'build');

fs.removeSync(buildFolder);
fs.removeSync(path.join(rootFolder, '_site'));

execSync('yarn build', { stdio: 'inherit', cwd: queueFolder });

fs.copyFileSync(path.join(buildFolder, 'manifest.json'), path.join(rootFolder, 'public', 'manifest.json'));
fs.copyFileSync(path.join(buildFolder, 'icon144.png'), path.join(rootFolder, 'icon144.png'));
fs.copySync(path.join(buildFolder, 'static'), path.join(rootFolder, 'public', 'static'));

const assets = fs.readJsonSync(path.join(buildFolder, 'asset-manifest.json'));
const htmlContents = fs.readFileSync(path.join(buildFolder, 'queue.html'), 'utf8');
const scripts = [];
for (const asset of assets.entrypoints) {
    if (asset.endsWith('.js')) {
        scripts.push(`<script src="/public/${asset}"></script>`);
    }
    if (asset.endsWith('.css')) {
        scripts.push(`<link rel="stylesheet" href="/public/${asset}" />`);
    }
}
fs.writeFileSync(path.join(rootFolder, 'queue.html'), `${htmlContents}${scripts.join('\n')}`);

// Build with jekyll
execSync('bundle exec jekyll build', { stdio: 'inherit' });

// put the service worker in the queue folder
fs.copyFileSync(path.join(buildFolder, 'service-worker.js.LICENSE.txt'), path.join(rootFolder, '_site', 'queue', 'service-worker.js.LICENSE.txt'));
fs.copyFileSync(path.join(buildFolder, 'service-worker.js.map'), path.join(rootFolder, '_site', 'queue', 'service-worker.js.map'));

const serviceWorkerContents = fs.readFileSync(path.join(buildFolder, 'service-worker.js'), 'utf8');
fs.writeFileSync(path.join(rootFolder, '_site', 'queue', 'service-worker.js'), serviceWorkerContents.replace(/\/public\/index\.html/g, '/queue/index.html'));

fs.copyFileSync(path.join(buildFolder, 'index.html'), path.join(rootFolder, '_site', 'queue', 'app.html'));