var config = {
  sassLang: 'libsass',
  sourcemaps: 'sourcemaps',
  sass: 'src/*.scss',
  dest: 'dist',
  browserSync: {
    server: {
      baseDir: './'
    },
    port: '3000',
    open: true,
    notify: false
  },

  watch: {
    js: 'src/**/*.js',
    testcafe: 'src/tiny-slider.native.js, tests/tests.js',
    html: ['**/*.html', 'tests/**/*.js']
  },

  js: {
    src: [[
        "bower_components/domtokenlist/src/token-list.js",
        "bower_components/requestAnimationFrame/requestAnimationFrame.js",

        "bower_components/go-native/src/utilities/childNode.remove.js",
        "bower_components/go-native/src/gn/base.js",
        "bower_components/go-native/src/gn/extend.js",
        "bower_components/go-native/src/gn/isInViewport.js",
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
      "bower_components/go-native/src/gn/isInViewport.js",
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
        "bower_components/go-native/src/ie8/addEventListener.js",
        "bower_components/go-native/src/ie8/firstElementChild.js",
        "bower_components/go-native/src/ie8/lastElementChild.js",
        "bower_components/go-native/src/ie8/previousElementSibling.js",
        "bower_components/go-native/src/ie8/nextElementSibling.js",
        "bower_components/go-native/src/ie8/getComputedStyle.js",
      ]],
    name: ['tiny-slider.js', 'tiny-slider.helper.js', 'tiny-slider.native.js', 'tiny-slider.ie8.js'],
    options: {
      // mangle: false,
      output: {
        quote_keys: true,
      },
      compress: {
        properties: false,
      }
    },
  },

  testcafe: {
    src: 'tests/tests.js',
    options: { browsers: ['chrome', 'safari'] },
  }
};

var gulp = require('gulp');
var php = require('gulp-connect-php');
var libsass = require('gulp-sass');
var rubysass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var modernizr = require('gulp-modernizr');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');
var path = require('path');
var svgmin = require('gulp-svgmin');
var svg2png = require('gulp-svg2png');
var inject = require('gulp-inject');
var browserSync = require('browser-sync').create();
var rename = require('gulp-rename');
var mergeStream = require('merge-stream');
var testcafe = require('gulp-testcafe');

function errorlog (error) {  
  console.error.bind(error);  
  this.emit('end');  
}  

// SASS Task
if (config.sassLang === 'libsass') {
  gulp.task('sass', function () {  
    return gulp.src(config.sass)  
        .pipe(sourcemaps.init())
        .pipe(libsass(config.libsass_options).on('error', libsass.logError))  
        .pipe(sourcemaps.write(config.sourcemaps))
        .pipe(gulp.dest(config.dest))
        .pipe(browserSync.stream());
  });  
} else {
  gulp.task('sass', function () {  
    return rubysass(config.sass, config.rubysass_options)  
        .pipe(sourcemaps.init())
        .on('error', rubysass.logError)  
        .pipe(sourcemaps.write(config.sourcemaps))
        .pipe(gulp.dest(config.dest))
        .pipe(browserSync.stream());
  });  
}

// JS Task  
gulp.task('js', function () {  
  var tasks = [], 
      srcs = config.js.src,
      names = config.js.name;
      
  for (var i = 0; i < srcs.length; i++) {
    tasks.push(
      gulp.src(srcs[i])
          .pipe(sourcemaps.init())
          .pipe(jshint())
          .pipe(jshint.reporter(stylish))
          .pipe(concat(names[i]))
          .on('error', errorlog)  
          .pipe(gulp.dest(config.dest))
          // .pipe(rename(names[i].replace('.js', '.min.js')))
          .pipe(uglify())
          .pipe(sourcemaps.write('../' + config.sourcemaps))
          .pipe(gulp.dest(config.dest + '/min'))
    );
  }

  return mergeStream(tasks)
      .pipe(browserSync.stream());
});

// testcafe
gulp.task('testcafe', () => {
  return gulp.src(config.testcafe.src)
    .pipe(testcafe(config.testcafe.options));
});

// browser-sync
gulp.task('sync', function() {
  browserSync.init(config.browserSync);
});

// Watch
gulp.task('watch', function () {
  gulp.watch(config.sass, ['sass']);
  gulp.watch(config.watch.js, ['js']).on('change', browserSync.reload);
  // gulp.watch(config.watch.testcafe, ['testcafe']);
  gulp.watch(config.watch.html).on('change', browserSync.reload);
});

// Default Task
gulp.task('default', [
  // 'sass',
  // 'js',
  'sync', 
  'watch', 
]);  