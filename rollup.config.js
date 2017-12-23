import typescript2 from 'rollup-plugin-typescript2'

const pkg = require('./package.json')

export default {
  input: 'src/bbc.ts',
  plugins: [typescript2()],
  output: [{ file: pkg.main, format: 'umd', name: 'bbc' }, { file: pkg.module, format: 'es' }],
}
