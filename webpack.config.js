const webpack = require('webpack');

const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = {
  entry: ['./src/client/goodchat.jsx'],
  output: {
    path: __dirname + '/dist',
    filename: "/js/bundle.js"
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new FaviconsWebpackPlugin({
      logo: './src/client/images/goodchat-g.png',
      prefix: 'icons/'
    }),
    // new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      {
        test: /\.less$/,
        loader: "style-loader!css-loader!less-loader"
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      }
    ]
  },
  eslint: {
    configFile: './.eslintrc'
  },
};
