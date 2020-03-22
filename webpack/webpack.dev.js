const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common')
const path = require('path')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',

    entry: {
        dev_server: [
            'webpack-dev-server/client?http://localhost:8080',
            'webpack/hot/dev-server'
        ]
    },

    devServer: {
        // host: '192.168.0.24', // Enabled to connect via wifi (you must open incomming port in firewall)
        hot: true,
        contentBase: path.join(__dirname, '../'),
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
})
