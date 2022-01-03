const path = require('path')

module.exports = {
    filenameHashing: false,
    productionSourceMap: false,
    css: {
        extract: true
    },
    configureWebpack: {
        devtool: 'inline-cheap-source-map',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        }
    },
    chainWebpack: config => {
        config.plugins.delete('html')
        config.plugins.delete('preload')
        config.plugins.delete('prefetch')
    }
}