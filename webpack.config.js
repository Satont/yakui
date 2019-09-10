var path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin') // плагин для загрузки кода Vue

module.exports = {
  mode: 'production',
  entry: './public/main.js',
  output: {
    path: path.resolve(__dirname, './public/dist'),
    publicPath: '/public/dist/',
    filename: 'build.js'
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }, {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
