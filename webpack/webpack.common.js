const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    target: 'web',
    entry: {
        index: path.join(__dirname, '../src/index.tsx'),
    },

    output: {
        path: path.join(__dirname, '../dist'),
        filename: '[name].bundle.js',
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx']
    },

    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
            { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/, query: { presets: ['@babel/preset-react', '@babel/preset-env'] } },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.less$/, use: ['style-loader', { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader', 'less-loader'] },
            { test: /\.(png|jpe?g|gif|svg)$/i, use: [{ loader: 'file-loader?name=images/[name].[ext]' }] },
        ]
    },

    plugins: [
        new webpack.IgnorePlugin(new RegExp("^(fs|ipc)$")),
        new HtmlWebpackPlugin({
            favicon: "./images/favicon.svg",
            template: path.join(__dirname, '../src/index.html'),
        }),
    ],
}
