'use strict';

const {execFileSync} = require('child_process');
const {mkdtempSync, writeFileSync} = require('fs');
const {tmpdir} = require('os');
const {join, resolve} = require('path');
const {URL} = require('url');
const {devDependencies} = require('../package.json');
const remove = require('../scripts/clean');

const root = resolve(__dirname, '..');
const revision = execFileSync('git', ['rev-parse', '--verify', `${process.argv[2] || 'HEAD'}^{commit}`], {
	cwd: root,
	encoding: 'utf8'
}).trim();
const consumer = mkdtempSync(join(tmpdir(), 'aws-sqs-push-git-install-'));
const sourceUrl = new URL('file:///');
sourceUrl.pathname = root;
const peerVersion = Number(process.versions.node.split('.')[0]) < 10 ? '2.580.0' : devDependencies['aws-sdk'];

try {
	writeFileSync(join(consumer, 'package.json'), JSON.stringify({private: true}));
	// Install a committed source snapshot, so an existing local lib cannot hide a missing prepare hook.
	execFileSync(process.execPath, [process.env.npm_execpath, 'install', '--allow-git=root', '--no-audit', '--no-fund',
		`git+${sourceUrl.href}#${revision}`, `aws-sdk@${peerVersion}`], {
		cwd: consumer,
		stdio: 'inherit'
	});

	execFileSync(process.execPath, ['-e', `
		const assert = require('assert');
		const fs = require('fs');
		const path = require('path');
		const pushMessage = require('aws-sqs-push');
		assert.strictEqual(typeof pushMessage, 'function');
		assert.strictEqual(pushMessage.default, pushMessage);
		const manifestPath = require.resolve('aws-sqs-push/package.json');
		const manifest = require(manifestPath);
		assert.ok(fs.existsSync(path.resolve(manifestPath, '..', manifest.types)), 'Git install must include declarations');
	`], {cwd: consumer, stdio: 'inherit'});
	console.log(`Git dependency installation passed for ${revision} on Node ${process.version}`);
} finally {
	remove(consumer);
}
