export default {
  cjs: {
    type: 'rollup',
    minify: true
  },
  esm: {
    type: 'rollup',
    minify: true
  },
  umd: {
    name: 'react-handwriting-keyboard',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    },
  },
  file: 'index',
  entry: 'src/index.js'
}