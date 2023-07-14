module.exports = {
    mode: 'production',
    output: {
        filename: 'gridtiler.min.js',
        library: 'gtil',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        babelrc: false,
                        cacheDirectory: true,
                        sourceMaps: false,
                    },
                },
            },
        ],
    },
    devtool: false,
    watch: false,
    optimization: {
        usedExports: true,
        minimize: true,
    },
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
