// プラグイン
const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require("gulp-autoprefixer");
const sassGlob = require('gulp-sass-glob-use-forward');
const sourcemaps = require('gulp-sourcemaps');
const connectSSI = require('connect-ssi');
const browserSync = require('browser-sync');
const csscomb = require('gulp-csscomb');
const cached = require('gulp-cached');
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const rename = require('gulp-rename');
const webp = require('gulp-webp');
var pug = require('gulp-pug');
// const changed = require("gulp-changed");
// プラグイン

const scss = "./**/css/*.scss";
const pugfile = ['src/**/*.pug', '!src/**/_*.pug'];

gulp.task('comb', () => {
 return gulp.src(scss)
  .pipe(cached(csscomb))
  .pipe(csscomb())
  .pipe(gulp.dest("./"));
});

gulp.task('pug', function () {
 return gulp
  .src(pugfile)
  .pipe(pug({
   pretty: true,
   basedir: './src'
  }))
  .pipe(gulp.dest('./dist/'));
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
  .pipe(sourcemaps.write("./"))
  .pipe(gulp.dest('./'));
 done();
});

// ローカル環境
gulp.task('browser-sync', (done) => {
 browserSync.init({
  server: {
   baseDir: './dist/',
   index: './index.html',
   middleware: [
    connectSSI({
     baseDir: __dirname + "/dist",
     ext: '.html'
    })
   ]
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
const slice_img = "./slice_img/**/*.{svg,gif,png,jpg,jpeg}";
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
  .pipe(
   rename(function (path) {
    path.dirname += '/img';
   })
  )
  .pipe(gulp.dest('./'));
});


//Webp

gulp.task("img-webp", function () {
 return gulp
  .src(slice_img)
  .pipe(cached(webp))
  .pipe(webp({
   quality: 80
  }))
  .pipe(
   rename(function (path) {
    path.dirname += '/img';
   })
  )
  .pipe(gulp.dest('./'));
});

// 監視ファイル
gulp.task('watch-files', (done) => {
 gulp.watch(pugfile, gulp.task('pug'));
 gulp.watch("./**/*.scss", gulp.task('sass'));
 gulp.watch("./slice_img/**", gulp.task('imagemin'));
 gulp.watch("./slice_img/**", gulp.task('img-webp'));
 gulp.watch("./*.html", gulp.task('browser-reload'));
 gulp.watch("./**/*.html", gulp.task('browser-reload'));
 gulp.watch("./**/*.css", gulp.task('browser-reload'));
 gulp.watch("./**/img/**", gulp.task('browser-reload'));
 gulp.watch("./**/*.js", gulp.task('browser-reload'));
 // gulp.watch("./scss/*.scss", gulp.task('comb'));
 done();
});

// タスク実行
gulp.task('default', gulp.series(gulp.parallel('watch-files', 'browser-sync'), (done) => {
 done();
}));