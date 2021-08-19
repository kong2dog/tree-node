const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin'),

    APP_PATH = path.resolve(__dirname, './src/index.js'),
    BUILD_PATH = path.resolve(__dirname, './dist'),
    TMP_PATH = path.resolve(__dirname, './src/index.html');

function resolve(dir) {
    return path.join(__dirname, dir);
}
module.exports = {
    entry: APP_PATH,
    output: {
        path: BUILD_PATH,
        filename: '[name].js' // 输出js
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': resolve('src')
        }
    },
    devServer: {
        host: '0.0.0.0',
        port: 8001,
        open: true
    //   proxy: {
    //     "/api": "http://localhost:3015"
    //   }
    },
    optimization: {
        minimize: true,
        runtimeChunk: {
            name: 'manifest'
        },
        splitChunks: {
            chunks: 'async',
            minSize: 200000,
            minChunks: 1,
            maxAsyncRequests: 10,
            maxInitialRequests: 5,
            automaticNameDelimiter: '~',
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'build.min.css',
            allChunks: true
        }),
        new HtmlWebpackPlugin({
            title: 'Game',
            template: TMP_PATH,
            filename: 'index.html',
            inject: 'body'
        }),
        // copy custom static assets
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, './src', 'assets'),
            to: path.resolve(__dirname, './dist', 'assets'),
            ignore: ['.*']
        }]),
        // webpack-dev-server enhancement plugins
        new DashboardPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.js[x]{0,1}$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: [
                                '@babel/plugin-transform-runtime',
                                'transform-class-properties',
                                '@babel/plugin-syntax-jsx'
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [{
                    loader: 'style-loader' // creates style nodes from JS strings
                }, {
                    loader: 'css-loader' // translates CSS into CommonJS
                }, {
                    loader: 'less-loader' // compiles Less to CSS
                }]
            },
            {
                test: /\.(png|jpg|gif|woff2|ttf|svg|eot)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: '[path][name].[ext]?[hash]'
                        }
                    }
                ]
            }
        ]
    }
};
