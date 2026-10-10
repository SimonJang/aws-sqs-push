'use strict';

const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const {existsSync, mkdtempSync, rmSync, writeFileSync} = require('node:fs');
const {createRequire} = require('node:module');
const {tmpdir} = require('node:os');
const {join, resolve} = require('node:path');
const {pathToFileURL} = require('node:url');
const {devDependencies} = require('../package.json');

const root = resolve(__dirname, '..');
const revision = execFileSync('git', ['rev-parse', '--verify', `${process.argv[2] || 'HEAD'}^{commit}`], {
	cwd: root,
	encoding: 'utf8'
}).trim();
const consumer = mkdtempSync(join(tmpdir(), 'aws-sqs-push-git-install-'));

try {
	writeFileSync(join(consumer, 'package.json'), JSON.stringify({private: true}));
	// Install a committed source snapshot, so an existing local lib cannot hide a missing prepare hook.
	execFileSync(process.execPath, [process.env.npm_execpath, 'install', '--allow-git=root', '--no-audit', '--no-fund',
		`git+${pathToFileURL(root).href}#${revision}`, `aws-sdk@${devDependencies['aws-sdk']}`], {
		cwd: consumer,
		stdio: 'inherit'
	});

	const consumerRequire = createRequire(join(consumer, 'package.json'));
	const pushMessage = consumerRequire('aws-sqs-push');
	assert.equal(typeof pushMessage, 'function');
	assert.equal(pushMessage.default, pushMessage);
	const manifestPath = consumerRequire.resolve('aws-sqs-push/package.json');
	const manifest = consumerRequire(manifestPath);
	assert.ok(existsSync(resolve(manifestPath, '..', manifest.types)), 'Git install must include declarations');
	console.log(`Git dependency installation passed for ${revision}`);
} finally {
	rmSync(consumer, {recursive: true, force: true});
}
