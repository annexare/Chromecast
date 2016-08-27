const
    fs = require('fs'),
    webpack = require('webpack'),
    nodeModules = fs.readdirSync('./app/node_modules')
        .filter(function (x) {
            return ['.bin'].indexOf(x) === -1;
        }),
    config = {
        context: __dirname + '/app',
        entry: [
            './index.js'
        ],
        target: 'electron',
        output: {
            path: './app',
            publicPath: './app',
            filename: 'main.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    // exclude: /node_modules/,
                    loader: 'babel',
                    query: {
                        presets: ['modern-browsers'],
                        plugins: [
                            'transform-class-properties'
                        ]
                    }
                }
            ]
        },
        node: {
            __dirname: true,
            __filename: true
        },
        externals: [
            function (context, request, callback) {
                let pathStart = request.split('/')[0];
                if (nodeModules.indexOf(pathStart) >= 0) {
                    return callback(null, 'commonjs2 ' + request);
                }

                callback();
            }
        ],
        // recordsPath: path.join(__dirname, 'build/_records'),
        plugins: [
            new webpack.IgnorePlugin(/\.(css|less|html)$/),
            // new webpack.BannerPlugin('require("source-map-support").install();',
            //     { raw: true, entryOnly: false }),
            // new webpack.HotModuleReplacementPlugin({ quiet: true })
        ]
    };

module.exports = config;