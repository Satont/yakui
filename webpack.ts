const VueLoaderPlugin = require('vue-loader/lib/plugin')
import { resolve } from 'path'

export default {
  entry: './public/index.ts',
  output: {
    path: resolve(__dirname, 'public', 'dest'),
    publicPath: resolve(__dirname, 'public', 'dest'),
    filename: 'build.js'
  }, 
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.css$/, use: 'css-loader' },
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  }
}