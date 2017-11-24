//----------------------------------------------------------------------------------------------------------------------
// Gruntfile
//----------------------------------------------------------------------------------------------------------------------

const webpackConfig = require('./webpack.config');

//----------------------------------------------------------------------------------------------------------------------

module.exports = function(grunt)
{
    grunt.initConfig({
        clean: ['dist'],
        copy: {
            index: {
                expand: true,
                cwd: 'client',
                src: ['index.html'],
                dest: 'dist'
            },
            static: {
                expand: true,
                cwd: 'client/static',
                src: ['**/*.*'],
                dest: 'dist/static'
            },
        },
        webpack: {
            build: webpackConfig
        },
        'webpack-dev-server': {
            options: {
                ...webpackConfig.devServer
            },
            start: {
                webpack: webpackConfig
            }
        }
    });

    //------------------------------------------------------------------------------------------------------------------

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-webpack');

    //------------------------------------------------------------------------------------------------------------------

    grunt.registerTask("build", ["clean", "copy", "webpack:build"]);
    grunt.registerTask("watch", ["clean", "copy", "webpack-dev-server:start"]);
    grunt.registerTask("default", ["watch"]);

    //------------------------------------------------------------------------------------------------------------------
};

//----------------------------------------------------------------------------------------------------------------------
