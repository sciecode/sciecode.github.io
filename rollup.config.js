import resolve from 'rollup-plugin-node-resolve';

export default {
	input: 'src/main.js',
	plugins: [
		resolve()
  ],
	output: [
		{
			format: 'iife',
			file: 'build/Atomize.js',
			indent: '\t'
		},
	]
};
