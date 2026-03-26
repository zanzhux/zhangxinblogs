const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
    transpileDependencies: true,
    configureWebpack: {
        devServer: {
            port: 8080,
            proxy: {
                '/api': {
                    target: 'http://localhost:3003',
                    changeOrigin: true
                }
            }
        },
        plugins: [
            new webpack.DefinePlugin({
                __VUE_OPTIONS_API__: JSON.stringify(true),
                __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
            })
        ]
    }
})