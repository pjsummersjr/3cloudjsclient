var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var ts = require("gulp-typescript");
var watch = require("gulp-watch");
var gulpWebpack = require("gulp-webpack");
var path = require('path');
var webpack = require('webpack')
var log = require('fancy-log');

var tsProject = ts.createProject("tsconfig.json");

var env = "production"
if(process.argv[2]){
    env = process.argv[2].split('=')[1];
}

gulp.task("default", ["web-files","server"]);
/**
 * This builds the server component
 */
gulp.task("server", function () {
    return tsProject.src()
        .on('end', function(){
            //log(`Arg: ${env}`);
        })
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});
/**
 * Copies html files from source to destination folder
 */
gulp.task("copy-html", function() {
    return gulp.src("src/web/*.html")
        .pipe(gulp.dest("dist/web"));
});
/**
 * Copies the adal.js file from src to the destination folder
 */
gulp.task("copy-js", function() {
    return gulp.src("src/web/scripts/adal.js")
        .pipe(gulp.dest("dist/web/scripts"));
});
/**
 * Uses webpack to build the Javascript file
 * It doesn't have any built-in dependencies. The primary external dependency is adal.js which
 * I am bringing in via a script tag in the HTML file
 * 
 * TODO: Externalize webpack configuration
 */
gulp.task("build-js", function(){
    var watchVal = false;
    var modeVal = 'production';
    if(env==='development'){
        watchVal = true;
        modeVal = 'development';
    }
    return gulp.src("src/web/scripts/app.js")
        .on('end', function(){
            log(`Mode: ${modeVal}`);
            log(`Watch: ${watchVal}`);
        })
        .pipe(gulpWebpack({
            mode:modeVal,
            output: {
                path: path.join(__dirname, 'dest', 'web', 'scripts'),
                filename: 'app.js'
            },
            devtool:'source-map',
            module: {
                rules: [
                    { test: /\.js$/,  loader: 'babel-loader'}
                ]
            },
            watch:watchVal
        }, webpack))  
        .pipe(gulp.dest("dist/web/scripts"));
})
/**
 * Handles the build,copy,etc. of all web client app files
 */
gulp.task("web-files", ["copy-html", "copy-js","build-js"]);