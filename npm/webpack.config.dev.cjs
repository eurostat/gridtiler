// dev
const LiveReloadPlugin = require('webpack-livereload-plugin')

module.exports = {
    mode: 'development',
    output: {
        filename: 'gridtiler.js',
        library: 'gtil',
        libraryTarget: 'umd',
    },
    plugins: [new LiveReloadPlugin()],
    watch: true,
    devtool: 'inline-source-map',
    resolve: {
        fallback: {
            "fs": false
        },
    },
    experiments: {
        asyncWebAssembly: true,
        //syncWebAssembly: true
    },
}
