const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');
const { globSync } = require('glob');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const webpack = require('webpack');

const getEntries = function () {
  return globSync(
    './src/{scripts/pages,styles/pages}/**/!(_)*.{scss,ts,js}',
  )
    .map(
      (entry) =>
        './' + entry.replace(/\\/g, '/').replace(/^\.\//, ''),
    )
    .reduce((entries, entry) => {
      const key = entry
        .split('/')
        .pop()
        .replace(/\.scss|\.ts|\.js/gi, '');
      let localEntries = { ...entries };
      if (key in entries) {
        localEntries[key].push(entry);
      } else {
        localEntries = Object.assign(entries, { [key]: [entry] });
      }
      return localEntries;
    }, {});
};

const commonConfig = {
  entry: getEntries(),
  mode: 'development',
  watch: true,
  devtool: 'source-map',
  stats: {
    children: false,
    chunks: true,
    entrypoints: false,
    colors: true,
    modules: false,
    warnings: true,
  },
  output: {
    filename: 'js/[name].js',
    chunkFilename: '[name].bundle.js?ver=[contenthash]',
    path: path.join(__dirname, '/dist'),
    clean: true,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.(js)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              api: 'modern',
              webpackImporter: true,
              sassOptions: {
                silenceDeprecations: ['import'],
              },
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: '../fonts/[name][ext]',
        },
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
        },
      },
      {
        test: /.*fonts.*\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: '[id].css',
    }),
    new LiveReloadPlugin({
      protocol: 'http',
    }),
    new ESLintPlugin({
      extensions: ['js'],
      fix: true,
    }),
    new webpack.ProgressPlugin(),
  ],
};

module.exports = commonConfig;
