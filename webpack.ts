import VueLoaderPlugin from 'vue-loader/lib/plugin';
import HtmlPlugin from 'html-webpack-plugin';
import { resolve } from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

export default {
  devServer: {
    historyApiFallback: true,
  },
  mode: 'development',
  parallelism: 4,
  entry: {
    panel: './src/panel/index.ts',
    login: './src/login/index.ts',
    oauth: './src/login/index.ts',
    public: './src/public/index.ts',
    overlays: './src/overlays/index.ts',
  },
  output: {
    path: resolve(__dirname, 'public', 'dest'),
    publicPath: '/static/',
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    pathinfo: false,
  },
  performance: { hints: false },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.vue$/i,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.ts$/i,
        use: {
          loader: 'ts-loader',
          options: { experimentalFileCaching: true, appendTsSuffixTo: [/\.vue$/] },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      dangerouslyAllowCleanPatternsOutsideProject: true,
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
    new HtmlPlugin({
      filename: '../panel.html',
      template: 'src/panel/index.html',
      chunks: ['panel'],
    }),
    new HtmlPlugin({
      filename: '../login.html',
      template: 'src/login/index.html',
      chunks: ['login'],
    }),
    new HtmlPlugin({
      filename: '../oauth.html',
      template: 'src/oauth/index.html',
      chunks: ['oauth'],
    }),
    new HtmlPlugin({
      filename: '../public.html',
      template: 'src/public/index.html',
      chunks: ['public'],
    }),
    new HtmlPlugin({
      filename: '../overlays.html',
      template: 'src/overlays/index.html',
      chunks: ['overlays'],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve(__dirname, 'src'),
      '@src': resolve(__dirname, 'src'),
      '@bot': resolve(__dirname, 'src', 'bot'),
      '@panel': resolve(__dirname, 'src', 'panel'),
      '@login': resolve(__dirname, 'src', 'login'),
    },
    fallback: { querystring: require.resolve('querystring-es3') },
  },
};
