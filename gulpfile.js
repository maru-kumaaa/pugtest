// プラグイン
const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require("gulp-autoprefixer");
const sassGlob = require('gulp-sass-glob-use-forward');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const csscomb = require('gulp-csscomb');
const cached = require('gulp-cached');
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const webp = require('gulp-webp');
const pug = require('gulp-pug');
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const cleanCSS = require("gulp-clean-css");
const htmlmin = require('gulp-htmlmin');
// const connectSSI = require('connect-ssi');
// const rename = require('gulp-rename');
// const changed = require("gulp-changed");
// プラグイン

const scss = ["./**/css/*.scss"];
const pugfile = ['./**/*.pug', '!./**/_*.pug', '!./node_modules/**/*.pug', '!./.history/**/*.pug'];
const slice_img = ["./**/img/*.{svg,gif,png,jpg,jpeg}", "!./_dist/**/img/*.{svg,gif,png,jpg,jpeg}", "!./.history/**/img/*.{svg,gif,png,jpg,jpeg}", "!./node_modules/**/*.{svg,gif,png,jpg,jpeg}"];
const js = ["./**/*.js", "!./_dist/**/*.js", "!./node_modules/**/*.js", "!./gulpfile.js"];

gulp.task('comb', () => {
 return gulp.src(scss)
  .pipe(cached(csscomb))
  .pipe(csscomb())
  .pipe(gulp.dest("./_dist"));
});

gulp.task('pug', (done) => {
 gulp.src(pugfile)
  .pipe(pug({
   pretty: true,
   basedir: './'
  }))
  .pipe(plumber())
  .pipe(htmlmin({
   // 余白を除去する
   collapseWhitespace: true,
   // HTMLコメントを除去する
   removeComments: true
  }))
  .pipe(gulp.dest('./_dist'));
 done();
});

gulp.task('uglify', (done) => {
 gulp.src(js)
  .pipe(plumber())
  .pipe(uglify())
  .pipe(gulp.dest('./_dist'));
 done();
});

// sassコンパイル
gulp.task('sass', (done) => {
 gulp.src(scss)
  .pipe(cached(sass))
  .pipe(sourcemaps.init())
  .pipe(sassGlob())
  .pipe(sass({
   outputStyle: 'expanded'
  }))
  .on("error", sass.logError)
  .pipe(autoprefixer())
  .pipe(csscomb())
  .pipe(cleanCSS())
  .pipe(sourcemaps.write("./"))
  .pipe(gulp.dest('./_dist'));
 done();
});

// ローカル環境
gulp.task('browser-sync', (done) => {
 browserSync.init({
  server: {
   baseDir: './_dist/',
   index: './index.html',
  },
 });
 done();
});

// リロード設定
gulp.task('browser-reload', (done) => {
 browserSync.reload();
 done();
});

//画像圧縮
gulp.task("imagemin", function () {
 return gulp
  .src(slice_img)
  .pipe(cached(imagemin))
  .pipe(
   imagemin([
    pngquant({
     quality: [.70, .80], // 画質
     speed: 1 // スピード
    }),
    mozjpeg({
     quality: 80
    }), // 画質
    imagemin.svgo(),
    imagemin.optipng(),
    imagemin.gifsicle({
     optimizationLevel: 3
    }) // 圧縮率
   ])
  )
  // .pipe(
  //  rename(function (path) {
  //   path.dirname += '/img';
  //  })
  // )
  .pipe(gulp.dest('./_dist'));
});


//Webp

gulp.task("img-webp", function () {
 return gulp
  .src(slice_img)
  .pipe(cached(webp))
  .pipe(webp({
   quality: 80
  }))
  // .pipe(
  //  rename(function (path) {
  //   path.dirname += '/img';
  //  })
  // )
  .pipe(gulp.dest('./_dist'));
});

// 監視ファイル
gulp.task('watch-files', (done) => {
 gulp.watch("./**/*.pug", gulp.task('pug'));
 gulp.watch(js, gulp.task('uglify'));
 gulp.watch("./**/*.scss", gulp.task('sass'));
 gulp.watch(["./**/img/**", "!./_dist/**"], gulp.task('imagemin'));
 gulp.watch(["./**/img/**", "!./_dist/**"], gulp.task('img-webp'));
 gulp.watch("./**/*.html", gulp.task('browser-reload'));
 gulp.watch("./**/*.css", gulp.task('browser-reload'));
 gulp.watch("./_dist/**/img/**", gulp.task('browser-reload'));
 gulp.watch("./_dist/**/*.js", gulp.task('browser-reload'));
 done();
});

// タスク実行
gulp.task('default', gulp.series(gulp.parallel('watch-files', 'browser-sync'), (done) => {
 done();
}));
