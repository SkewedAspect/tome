//----------------------------------------------------------------------------------------------------------------------
// Webpack Config
//----------------------------------------------------------------------------------------------------------------------

const config = require('./config');

const path = require('path');
const webpack = require('webpack');

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    entry: './client/app.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'app.js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        'scss': 'vue-style-loader!css-loader!sass-loader',
                        'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
                    }
                    // other vue-loader options go here
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            },
            {
                test: /\.(css)$/,
                loader: ['style-loader', 'css-loader']
            },
            {
                test: /\.(scss)$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins()
                            {
                                return [
                                    require('precss'),
                                    require('autoprefixer')
                                ];
                            }
                        }
                    },
                    { loader: 'sass-loader' }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    devServer: {
        publicPath: '/',
        host: '0.0.0.0',
        port: config.http.port + 1,
        contentBase: path.join(__dirname, "dist"),
        disableHostCheck: true,
        historyApiFallback: true,
        noInfo: true,
        proxy: {
            '/': {
                target: `http://localhost:${ config.http.port }`,
                changeOrigin: true,
                secure: false
            }
        }
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map'
}; // end module.exports

//----------------------------------------------------------------------------------------------------------------------
// Production configuration
//----------------------------------------------------------------------------------------------------------------------

if(process.env.NODE_ENV === 'production')
{
    module.exports.devtool = '#source-map';

    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([

        // Set our environment
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),

        // Uglify the source code
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),

        // Minimize the size
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]);
} // end if

//----------------------------------------------------------------------------------------------------------------------
