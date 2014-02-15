module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        typescript: {
            base: {
                src: 'src/sb.ts',
                dest: 'build/sb.js',
                options: { comments: true }
            }
        },

        uglify: {
            build: {
                src: 'build/sb.js',
                dest: 'dist/sb.min.js'
            }
        },

        watch: {
            ts: {
                files: 'src/sb.ts',
                tasks: 'typescript'
            },
            js: {
                files: 'build/sb.js',
                tasks: 'uglify'
            }
        }

    });

    grunt.registerTask('default', ['watch']);

};