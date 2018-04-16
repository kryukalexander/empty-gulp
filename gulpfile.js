'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const posthtml = require('gulp-posthtml');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const del = require('del');
const concat = require('gulp-concat');

const FolderStructure = function(root, build) {

    this.root = root;
    this.build = build;
    
    this.styles = {
        dev: this.root + 'css/**/*.scss',
        build: this.build + 'css/'
    };

    this.createIgnoreFolders = (arr, prefix) => {
        let result = [];
        arr.map( (el) => {result.push( '!' + this.root + prefix + el)} );
        return result;
    };

    this.html = {
        dev: this.root + '**/*.html',
        build: this.build,
        ignore: this.createIgnoreFolders(['/**/', '/**/*.html'], '/include')
    };

    this.js = {
        dev: this.root + 'js/*.js',
        build: this.build + 'js'
    };

    this.images = {
        dev: this.root + 'images/**/*',
        build: this.build + 'images',
        ignore: this.createIgnoreFolders([ 'sprite/*', 'vector/*', 'sprite/', 'vector/' ], 'images/images-')
    };

    this.fonts = {
        dev: this.root + 'fonts/**/*',
        build: this.build + 'fonts'
    };
};

const folders = new FolderStructure('./src/', './build/');

//CSS
gulp.task('css', () => {
    let isProd = process.env.npm_lifecycle_event === 'build';

    if (isProd) {
        return gulp.src(folders.styles.dev)
            .pipe(sass.sync().on('error', sass.logError))
            .pipe(postcss())
            .pipe(gulp.dest(folders.styles.build));
    } else {

        return gulp.src(folders.styles.dev)
            .pipe(sourcemaps.init())
            .pipe(sass.sync().on('error', sass.logError))
            .pipe(postcss())
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(folders.styles.build));
    }
});

//JS
gulp.task('js', () => {
    let scripts = folders.js.dev;
    return gulp.src(scripts)
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(gulp.dest(folders.js.build));
});

//HTML
gulp.task('html', () => {
    return gulp.src( [folders.html.dev, ...folders.html.ignore] )
        .pipe(posthtml())
        .pipe(gulp.dest(folders.html.build));
});

//Images
gulp.task('build:images', ['css'], () => {
    gulp.src( [folders.images.dev, ...folders.images.ignore] )

        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))

        .pipe(gulp.dest(folders.images.build));
});

//Browser sync
gulp.task('browser-sync', () => {
    browserSync({
        server: { 
            baseDir: folders.build, 
            directory: true
        },
        notify: false
    });
});

//Watch
gulp.task('watch', ['build:all', 'browser-sync'], () => {
    gulp.watch(folders.styles.dev, ['css', browserSync.reload]);
    gulp.watch(folders.js.dev, ['js', browserSync.reload]);
    gulp.watch(folders.html.dev, ['html', browserSync.reload]);
    gulp.watch('./posthtml.config.js', ['html', browserSync.reload]);
});

//Clean
gulp.task('clean', () => {
    del.sync(folders.build);
    del.sync('src/images/sprite.png');
    del.sync('src/images/sprite.svg');
});

//Build
gulp.task('build:all', ['clean', 'html', 'js', 'build:images'], () => {
    gulp.src(folders.fonts.dev).pipe(gulp.dest(folders.fonts.build));
});