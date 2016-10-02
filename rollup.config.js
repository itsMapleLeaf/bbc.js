import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  dest: 'dist/bbc.js',
  format: 'umd',
  moduleName: 'BBC',
  plugins: [
    babel({
      presets: [
        ['latest', {
          es2015: { modules: false },
        }],
      ],
      plugins: [
        'transform-object-rest-spread',
        'transform-flow-strip-types',
      ],
      babelrc: false,
    }),
  ],
}
