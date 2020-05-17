const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['./src/index.js', './src/assets/style/index.css'],
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
          },
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: './postcss.config.js',
              },
            },
          },
        ],
      },
      {
        test: /\.(jpg|png)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'imgs/[name].[ext]',
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      cache: true,
      title: 'Loogup',
      template: path.join(__dirname, 'index.html'),
      output:path.resolve(__dirname, 'dist'),
      xhtml: true,
    }),
  ],
  // watch: true,
  // Development Tools (Map Errors To Source File)
  devtool: 'source-map',
  resolve: {
    alias: {
      _constants: path.resolve(__dirname, 'src/constants'),
      _controllers: path.resolve(__dirname, 'src/controllers'),
      _models: path.resolve(__dirname, 'src/models'),
      _utils: path.resolve(__dirname, 'src/utils'),
      _views: path.resolve(__dirname, 'src/views'),
    },
  },
}
