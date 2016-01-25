#! /usr/bin/env node

var gulp = require('gulp');

//TODO These three still need to be implemented
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var globby = require('globby');
var through = require('through2');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');


/* Semantic UI gulp tools */
var watch = require('./semantic/tasks/watch.js');
var build = require('./semantic/tasks/build.js');


var fs = require('fs');

var jsDir = './client/js/*';
var scssDir = './client/scss/*';

var jsOut = 'bundle.js';
var jsOutDir = './client';
var scssOut = 'styles.css';
var scssOutDir = './client';

var scssIncludeDirs = ["./bower_components/foundation-sites", "./bower_components/foundation-sites/scss", "./bower_components/foundation-sites/scss/*"];

gulp.task('semantic-build', 'Builds Semantic UI with customized variables', build);
gulp.task('semantic-watch', 'Watches for Semantic UI changes', watch);

function cleanDir(dirc){
    fs.readdir(dirc, function(err, files){
        if(err){
            console.log(err);
        }else{
            for(var file in files){
                fs.unlinkSync(dirc + '/' + files[file]);
            }
            console.log('Cleaned out '+dirc);
        }
    });
}

gulp.task('sass', function(){
    return gulp.src(scssDir)
            .pipe(concat(scssOut))
            .pipe(sass({includePaths: scssIncludeDirs}))
            .pipe(gulp.dest(scssOutDir));
});

gulp.task('browserify', function () {
    var bundledStream = through();

    bundledStream
        //Below line is just for stream compatability
        .pipe(source('app.js'))
        .pipe(rename(jsOut))
        .pipe(gulp.dest(jsOutDir));

    globby([jsDir]).then(function(entries) {
        // create the Browserify instance.
        var b = browserify({
            entries: entries,
            presets: ['react', 'es2015']
        });

        b.transform('babelify', {presets: ['es2015', 'react']})
            .bundle()
            .on('error', function(err){
                console.log('JSX/Babelify error!!!');
                bundledStream.emit('error', err);
            })
            .pipe(bundledStream);
    }).catch(function(err) {
        bundledStream.emit('error', err);
    });

    return bundledStream;
});

gulp.task('start', function(){
    nodemon({
        script: './server.js',
        watch: ['./api/', './config/', 'app.js', 'server.js']
    }).on('quit', function(){
        console.log('Server is shutting down...');
        cleanDir('./uploads');
        cleanDir('./artwork');
        console.log('Shutdown complete');
    });
});

gulp.task('watch', function(){
    gulp.watch(scssDir, ['sass']);
    gulp.watch(jsDir, ['browserify']);
    for(var dir in scssIncludeDirs){
        gulp.watch(scssIncludeDirs[dir]+'/*', ['sass']);
    }
});

gulp.task('default', ['sass', 'browserify', 'start', 'watch']);

gulp.task('semantic', ['semantic-build', 'semantic-watch']);
