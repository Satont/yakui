const VueLoaderPlugin = require('vue-loader/lib/plugin')
import { resolve } from 'path'

export default {
  mode: 'development',
  entry: './src/web/index.ts',
  output: {
    path: resolve(__dirname, 'public', 'dest'),
    publicPath: resolve(__dirname, 'public', 'dest'),
    filename: 'build.js'
  }, 
  module: {
    rules: [
      { test: /\.vue$/i, loader: 'vue-loader' },
      { test: /\.css$/i, use: ['vue-style-loader', 'css-loader'] },
      { test: /\.ts$/i, use: { loader: 'ts-loader', options: { experimentalFileCaching: true, appendTsSuffixTo: [/\.vue$/] } } }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  }
}
