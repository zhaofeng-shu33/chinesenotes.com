const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

module.exports = [
  {
    entry: "./cnotes.scss",
    output: {
      filename: "style-cnotes.js",
    },
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'cnotes.css',
            },
          },
          { loader: 'extract-loader' },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['./node_modules']
            },
          },
        ]
      }],
    },
  },
  {
    mode: 'development',
    entry:  {
      app: [
        './src/index.ts',
      ]
    },
    output: {
      filename: "./cnotes-compiled.js",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __VERSION__: JSON.stringify(require("./package.json").version)
      })
    ],
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
  },
];
