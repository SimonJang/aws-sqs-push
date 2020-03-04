'use strict';
const path = require('path');
const AddModuleExportsPlugin = require('add-module-exports-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: './source/index.ts',
	target: 'node',
	node: false,
	output: {
		path: path.join(__dirname, 'lib'),
		filename: 'index.js',
		libraryTarget: 'commonjs2'
	},
	resolve: {
		extensions: [
			'.ts',
			'.js'
		]
	},
	plugins: [
		new AddModuleExportsPlugin(),
	],
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'awesome-typescript-loader'
			}
		]
	},
	externals: {
		'aws-sdk': 'aws-sdk'
	}
};
