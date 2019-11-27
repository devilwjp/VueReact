/* eslint-disable prefer-object-spread/prefer-object-spread */

import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import {uglify} from 'rollup-plugin-uglify'
import commonjs from 'rollup-plugin-commonjs'

const shared = {
  input: 'src/index.js',
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    babel({
      exclude: 'node-modules/**',
    }),
    commonjs(),
    uglify({
      compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true
      }
    })
  ],
  external: ['react', 'react-dom', 'vue'],
}

export default [
  Object.assign({}, shared, {
    output: {
      file: 'dist/vuereact.umd.js',
      format: 'umd',
      name: 'vuereact',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        vue: 'Vue',
      },
    },
  }),
]
