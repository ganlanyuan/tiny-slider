const gulp = require('gulp');
const libsass = require('gulp-sass');
const rubysass = require('gulp-ruby-sass');
const sourcemaps = require('gulp-sourcemaps');
const modernizr = require('gulp-modernizr');
const uglify = require('gulp-uglify');
const jshint = require('gulp-jshint');
const rename = require('gulp-rename');
const stylish = require('jshint-stylish');
const browserSync = require('browser-sync').create();
const change = require('gulp-change');

const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const buble = require('rollup-plugin-buble');
const eslint = require('rollup-plugin-eslint');
const resolve = require('rollup-plugin-node-resolve');
const uglifyRollup = require('rollup-plugin-uglify');

let sourcemapsDest = 'sourcemaps';
let libName = 'tiny-slider',
    testName = 'script',
    proPostfix = '.pro',
    devPostfix = '.dev',
    helperIEPostfix = '.helper.ie8',
    proScript = libName + proPostfix + '.js',
    devScript = libName + devPostfix + '.js',
    helperIEScript = libName + helperIEPostfix + '.js',
    testScript = testName + '.js',
    sassFile = libName + '.scss',
    pathSrc = 'src/',
    pathDest = 'dist/',
    pathTest = 'tests/js/',
    scriptSources = [pathSrc + '**/*.js', '!' + pathSrc + devScript, '!' + pathSrc + helperIEScript];


function errorlog (error) {  
  console.error.bind(error);  
  this.emit('end');  
}  

// SASS Task
gulp.task('sass', function () {  
  return gulp.src(sassFile)  
    .pipe(sourcemaps.init())
    .pipe(libsass({
      outputStyle: 'compressed', 
      precision: 7
    }).on('error', libsass.logError))  
    .pipe(sourcemaps.write(sourcemapsDest))
    .pipe(gulp.dest(pathDest))
    .pipe(browserSync.stream());
});  

// Script Task
gulp.task('script', function () {
  return rollup({
    entry: pathSrc + proScript,
    context: 'window',
    treeshake: false,
    plugins: [
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
    ],
  }).then(function (bundle) {
    return bundle.write({
      dest: pathDest + libName + '.js',
      format: 'es',
      // moduleName: 'tns',
    });
  });
});

gulp.task('helper-ie8', function () {
  return rollup({
    entry: pathSrc + helperIEScript,
  }).then(function (bundle) {
    return bundle.write({
      dest: pathDest + helperIEScript,
      format: 'es',
    });
  });
});

gulp.task('editPro', ['script'], function() {
  return gulp.src(pathDest + libName + '.js')
    .pipe(change(function (content) {
      return 'var tns = (function (){\n' + content.replace('export { tns }', 'return tns') + '})();';
    }))
    .pipe(gulp.dest(pathDest))
});

gulp.task('makeDevCopy', function() {
  return gulp.src(pathSrc + proScript)
    .pipe(change(function (content) {
      return content
        .replace('PRODUCTION', 'DEVELOPMENT')
        .replace(/bower_components/g, '..');
    }))
    .pipe(rename({ basename: libName + devPostfix }))
    .pipe(gulp.dest(pathSrc))
});

gulp.task('min', ['editPro'], function () {
  return gulp.src(pathDest + '*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('../' + sourcemapsDest))
    .pipe(gulp.dest(pathDest + 'min'))
})

gulp.task('test', function () {
  return rollup({
    entry: pathTest + testScript,
    context: 'window',
    // treeshake: false,
    plugins: [
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
    ],
  }).then(function (bundle) {
    return bundle.write({
      dest: pathTest + testName + '.min.js',
      format: 'iife',
      moduleName: 'tiny',
    });
  });
});

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
  gulp.watch(pathSrc + 'sassFile', ['sass']);
  gulp.watch(pathSrc + proScript, ['makeDevCopy']);
  gulp.watch(scriptSources, ['min']);
  gulp.watch(scriptSources.concat([pathTest + testScript]), ['test']).on('change', browserSync.reload);
  gulp.watch('**/*.html').on('change', browserSync.reload);
  // gulp.watch('src/tiny-slider.native.js, tests/tests.js', ['testcafe']);
});

// Default Task
gulp.task('default', [
  // 'sass',
  // 'min',
  // 'helper-ie8',
  // 'makeDevCopy',
  // 'test',
  'server', 
  'watch', 
]);  