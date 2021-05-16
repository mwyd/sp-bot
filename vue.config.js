module.exports = {
    filenameHashing: false,
    productionSourceMap: false,
    css: {
        extract: true
    },
    configureWebpack: {
        devtool: 'inline-cheap-source-map'
    },
    chainWebpack: config => {
        config.plugins.delete('html')
        config.plugins.delete('preload')
        config.plugins.delete('prefetch')
    }
}