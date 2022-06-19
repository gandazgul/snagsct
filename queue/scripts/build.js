const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const path = require('path');

const rootFolder = path.resolve('.');
const queueFolder = path.resolve(rootFolder, 'queue');
const buildFolder = path.resolve(queueFolder, 'build');

fs.removeSync(buildFolder);
fs.removeSync(path.join(rootFolder, '_site'));

execSync('yarn build', { stdio: 'inherit', cwd: queueFolder });

fs.copyFileSync(path.join(buildFolder, 'index.html'), path.join(rootFolder, 'queue_app.html'));
fs.copyFileSync(path.join(buildFolder, 'manifest.json'), path.join(rootFolder, 'manifest.json'));
fs.copySync(path.join(buildFolder, 'static', 'css'), path.join(rootFolder, 'public', 'static', 'css'));
fs.copySync(path.join(buildFolder, 'static', 'js'), path.join(rootFolder, 'public', 'static', 'js'));

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

execSync('jekyll build', { stdio: 'inherit' });
