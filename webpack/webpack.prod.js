const merge = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        nodeEnv: 'production',
        minimize: true,
    },
})

process.env.NODE_ENV = 'production' // Hack to allow POSTCSS to work in production