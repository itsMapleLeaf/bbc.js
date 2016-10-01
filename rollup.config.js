import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  dest: 'dist/bbc.js',
  format: 'iife',
  moduleName: 'BBC',
  plugins: [ babel() ],
}
