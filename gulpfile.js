const gulp = require('gulp');
const libsass = require('gulp-sass');
const rubysass = require('gulp-ruby-sass');
const sourcemaps = require('gulp-sourcemaps');
const modernizr = require('gulp-modernizr');
const uglify = require('gulp-uglify');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const browserSync = require('browser-sync').create();

const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const buble = require('rollup-plugin-buble');
const eslint = require('rollup-plugin-eslint');
const resolve = require('rollup-plugin-node-resolve');
const uglifyRollup = require('rollup-plugin-uglify');
const multiEntry = require('rollup-plugin-multi-entry');

let sassLang = 'libsass';
let sassSrc = 'src/*.scss';
let dest = 'dist';
let sourcemapsDest = 'sourcemaps';

function errorlog (error) {  
  console.error.bind(error);  
  this.emit('end');  
}  

// SASS Task
gulp.task('sass', function () {  
  return gulp.src(sassSrc)  
    .pipe(sourcemaps.init())
    .pipe(libsass({
      outputStyle: 'compressed', 
      precision: 7
    }).on('error', libsass.logError))  
    .pipe(sourcemaps.write(sourcemapsDest))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
});  

let config = {
  js: {
    src: [[
        "bower_components/domtokenlist/src/token-list.js",
        "bower_components/requestAnimationFrame/requestAnimationFrame.js",

        "bower_components/go-native/src/utilities/childNode.remove.js",
        "bower_components/go-native/src/gn/base.js",
        "bower_components/go-native/src/gn/extend.js",
        "bower_components/go-native/src/gn/indexOf.js",
        "bower_components/go-native/src/gn/getSupportedProp.js",
        "bower_components/go-native/src/gn/DOM.ready.js",
        "bower_components/go-native/src/gn/isNodeList.js",
        "bower_components/go-native/src/gn/append.js",
        "bower_components/go-native/src/gn/wrap.js",
        "bower_components/go-native/src/gn/unwrap.js",

        "src/tiny-slider.native.js",
      ], [
      "bower_components/domtokenlist/src/token-list.js",
      "bower_components/requestAnimationFrame/requestAnimationFrame.js",

      "bower_components/go-native/src/utilities/childNode.remove.js",
      "bower_components/go-native/src/gn/base.js",
      "bower_components/go-native/src/gn/extend.js",
      "bower_components/go-native/src/gn/indexOf.js",
      "bower_components/go-native/src/gn/getSupportedProp.js",
      "bower_components/go-native/src/gn/DOM.ready.js",
      "bower_components/go-native/src/gn/isNodeList.js",
      "bower_components/go-native/src/gn/append.js",
      "bower_components/go-native/src/gn/wrap.js",
      "bower_components/go-native/src/gn/unwrap.js",
      ], [
        "src/tiny-slider.native.js",
      ], [
        "bower_components/go-native/src/es5/object/keys.js",
        "bower_components/go-native/src/es5/array/isArray.js",
        "bower_components/go-native/src/es5/array/forEach.js",
        "bower_components/go-native/src/ie8/addEventListener.js",
        "bower_components/go-native/src/ie8/firstElementChild.js",
        "bower_components/go-native/src/ie8/lastElementChild.js",
        "bower_components/go-native/src/ie8/previousElementSibling.js",
        "bower_components/go-native/src/ie8/nextElementSibling.js",
        "bower_components/go-native/src/ie8/getComputedStyle.js",
      ]],
    name: ['tiny-slider.js', 'tiny-slider.helper.js', 'tiny-slider.native.js', 'tiny-slider.ie8.js'],
  }

};

// Script Task
gulp.task('script', function () {
  return rollup({
    entry: 'src/tiny-slider.js',
    context: 'window',
    plugins: [
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
    ],
  }).then(function (bundle) {
    return bundle.write({
      dest: 'dist/tiny-slider.js',
      format: 'iife',
      moduleName: 'tns',
    });
  });
});

gulp.task('script-ie8', function () {
  return rollup({
    entry: 'src/tiny-slider.helper.ie8.js',
  }).then(function (bundle) {
    return bundle.write({
      dest: 'dist/tiny-slider.helper.ie8.js',
      format: 'es',
    });
  });
});

gulp.task('script-min', ['script'], function () {
  return gulp.src('dist/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('../' + sourcemapsDest))
    .pipe(gulp.dest('dist/min'))
})

// let testcafeObj = {
//   src: 'tests/tests.js',
//   options: { browsers: ['chrome', 'safari'] },
// };
// testcafe
// gulp.task('testcafe', () => {
//   return gulp.src(testcafeObj.src)
//     .pipe(testcafe(testcafeObj.options));
// });

// browser-sync
gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    port: '3000',
    open: false,
    notify: false
  });
});

// Watch
gulp.task('watch', function () {
  gulp.watch(sassSrc, ['sass']);
  gulp.watch('src/**/*.js', ['script-min']).on('change', browserSync.reload);
  gulp.watch(['**/*.html', 'tests/**/*.js']).on('change', browserSync.reload);
  // gulp.watch('src/tiny-slider.native.js, tests/tests.js', ['testcafe']);
});

// Default Task
gulp.task('default', [
  // 'sass',
  'script-min',
  // 'script-ie8',
  'server', 
  'watch', 
]);  