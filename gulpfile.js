
var dest = 'dist/';

var pkg = require('./package.json')

var del = require('del');
var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var htmlReplace = require('gulp-html-replace');
var htmlMin = require('gulp-htmlmin');


gulp.task('css', [], function() {
   return gulp
      .src('index.css')
      .pipe(autoprefixer({
         browsers: ['last 2 version', '> 5%']
      }))
      .pipe(cleanCSS())
      .pipe(rename(pkg.name + '-' + pkg.version + '.min.css'))
      .pipe(gulp.dest(dest));
});


gulp.task('js', [], function() {
   return gulp
      .src('index.js')
      .pipe(uglify())
      .pipe(rename(pkg.name + '-' + pkg.version + '.min.js'))
      .pipe(gulp.dest(dest));
});


gulp.task('img', [], function() {
   return gulp
      .src('img/**/*')
      .pipe(gulp.dest(dest + 'img'));
});


gulp.task('html', [], function() {
   return gulp
      .src('index.html')
      .pipe(htmlReplace({
         js: pkg.name + '-' + pkg.version + '.min.js',
         css: pkg.name + '-' + pkg.version + '.min.css'
      }))
      .pipe(htmlMin({collapseWhitespace: true}))
      .pipe(gulp.dest(dest));
});


gulp.task('clean', function() {
   del(dest);
});

gulp.task('default', ['clean', 'css', 'js', 'img', 'html']);

