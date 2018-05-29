var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var babel = require('gulp-babel');

gulp.task('browserSync', function() {
    browserSync.init({
        server:'./'
    });
});

gulp.task('sass', function(){
    return gulp.src('assets/scss/main.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({
        stream: true
    }))
});

gulp.task('uglify', function() {
    gulp.src('assets/js/app.js')
    .pipe(babel({
        presets:['env']
    }))
    .pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.reload({
        stream: true
    }))
});

gulp.task('watch',['browserSync','sass','uglify'], function (){
  gulp.watch('assets/scss/main.scss', ['sass']); 
  gulp.watch('assets/js/app.js',['uglify']);
});

gulp.task('default', ['browserSync','uglify','sass','watch']);
