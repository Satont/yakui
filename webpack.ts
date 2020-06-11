import VueLoaderPlugin from 'vue-loader/lib/plugin'
import HtmlPlugin from 'html-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import { resolve } from 'path'

export default {
  mode: 'development',
  entry: {
    panel: './src/panel/index.ts',
    login: './src/login/index.ts',
  },
  output: {
    path: resolve(__dirname, 'public', 'dest'),
    publicPath: '/static/',
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    pathinfo: false,
  },
  module: {
    rules: [
      { test: /\.vue$/i, loader: 'vue-loader' },
      { test: /\.css$/i, use: ['vue-style-loader', 'css-loader'] },
      { test: /\.ts$/i, use: { loader: 'ts-loader', options: { experimentalFileCaching: true, appendTsSuffixTo: [/\.vue$/] } } }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new HtmlPlugin({
      filename: '../index.html', template: 'src/panel/index.html', chunks: ['panel']
    }),
    new HtmlPlugin({
      filename: '../login.html', template: 'src/login/index.html', chunks: ['login']
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve(__dirname, 'src'),
      '@bot': resolve(__dirname, 'src', 'bot'),
      '@web': resolve(__dirname, 'src', 'web')
    }
  }
}
