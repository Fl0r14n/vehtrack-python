var gulp = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var watch = require('gulp-watch');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var bower = require('gulp-bower');
var rename = require('gulp-rename');

var paths = {
    scripts: ['js/**/*.js', '!js/**/*.min.js'],
    images: ['img/**/*'],
    css: ['css/**/*.css', '!css/**/*.min.css']
};

gulp.task('jsmin', function() {
    gulp.src(paths.scripts)
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('js'))
        .pipe(notify({message: 'Uglify complete'}));
});

gulp.task('cssmin', function() {
    gulp.src(paths.css)
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('css'))
        .pipe(notify({message: 'CSS minify complete'}));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['jsmin']);
    gulp.watch(paths.css, ['cssmin']);
});

gulp.task('bower-install', function() {
    bower().pipe(gulp.dest('lib/')).pipe(notify({message: 'Bower install completed'}));
});

gulp.task('bower-update', function() {
    bower({cmd: 'update'}).pipe(notify({message: 'Bower update completed'}));
});

gulp.task('build', ['bower-update', 'jsmin', 'cssmin']);

gulp.task('default', ['watch']);