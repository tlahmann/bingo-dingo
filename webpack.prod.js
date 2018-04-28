const merge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const common = require('./webpack.common.js')
const path = require('path')

module.exports = merge(common, {
  devtool: 'source-map',
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true
    })
  ],
  output: {
    filename: '[name].bundle.js', // Name of generated bundle after build
    publicPath: './', // public URL of the output directory when referenced in a browser
    path: path.resolve(__dirname, 'dist_client')// Folder to store generated bundle
  }
})
