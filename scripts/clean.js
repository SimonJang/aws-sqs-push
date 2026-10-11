'use strict';

const fs = require('fs');
const path = require('path');

function remove(target) {
	let stat;
	try {
		stat = fs.lstatSync(target);
	} catch (error) {
		if (error.code === 'ENOENT') return;
		throw error;
	}

	if (stat.isDirectory()) {
		fs.readdirSync(target).forEach(name => remove(path.join(target, name)));
		fs.rmdirSync(target);
	} else {
		fs.unlinkSync(target);
	}
}

module.exports = remove;

if (require.main === module) {
	remove(path.join(__dirname, '..', 'lib'));
}
