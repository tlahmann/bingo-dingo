const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {  // configuration for webpack-dev-server
    contentBase: './src/public',  // source of static assets
    port: 80 // port to run dev-server
  },
  output: {
    filename: '[name].bundle.js', // Name of generated bundle after build
    publicPath: '/', // public URL of the output directory when referenced in a browser
    path: path.resolve(__dirname, 'dist')// Folder to store generated bundle
  }
})
