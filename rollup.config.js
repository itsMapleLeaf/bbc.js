import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  dest: 'dist/bbc.js',
  format: 'iife',
  moduleName: 'BBC',
  plugins: [
    babel({
      presets: [
        ['latest', {
          es2015: { modules: false },
        }],
      ],
      modules: [
        'transform-object-rest-spread',
        'transform-flow-strip-types',
      ],
    }),
  ],
}
