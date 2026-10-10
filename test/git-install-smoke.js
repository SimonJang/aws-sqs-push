'use strict';

const {execFileSync} = require('child_process');
const {mkdirSync, mkdtempSync, writeFileSync} = require('fs');
const {tmpdir} = require('os');
const {join, resolve} = require('path');
const {URL} = require('url');
const legacyDependencies = require('../package.json').devDependencies;
const modernDependencies = require('./modern/package.json').devDependencies;
const remove = require('../scripts/clean');

const root = resolve(__dirname, '..');
const revision = execFileSync('git', ['rev-parse', '--verify', `${process.argv[2] || 'HEAD'}^{commit}`], {
	cwd: root,
	encoding: 'utf8'
}).trim();
const scratch = mkdtempSync(join(tmpdir(), 'aws-sqs-push-git-install-'));
const source = join(scratch, 'source.git');
const consumer = join(scratch, 'consumer');
const sourceUrl = new URL('file:///');
sourceUrl.pathname = source;
const legacy = Number(process.versions.node.split('.')[0]) < 10;
const peerVersion = (legacy ? legacyDependencies : modernDependencies)['aws-sdk'];
const dependencies = [`aws-sdk@${peerVersion}`];
if (legacy) dependencies.push(`sax@${legacyDependencies.sax}`);

try {
	// A unique Git URL prevents a tarball prepared by another runtime from masking preparation failures.
	execFileSync('git', ['clone', '--bare', '--quiet', root, source]);
	mkdirSync(consumer);
	writeFileSync(join(consumer, 'package.json'), JSON.stringify({private: true}));
	execFileSync(process.execPath, [process.env.npm_execpath, 'install', '--allow-git=root', '--no-audit', '--no-fund',
		`git+${sourceUrl.href}#${revision}`].concat(dependencies), {
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
	remove(scratch);
}
