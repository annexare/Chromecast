/**
 * Gulp tasks.
 */

'use strict';

let app = (path) => {
    return './app/' + (path || '');
};

let src = (path) => {
    return './src/' + (path || '');
};

let vendor = (path) => {
    return './node_modules/' + (path || '');
};

const
    electronVersion = '0.36.7',
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    paths = {
        desktopApp: './build',
        css: app('css/'),
        js: app('js/'),
        src: '',
        srcBackend: [
            app('*.js'),
            'gulpfile.js'
        ],
        srcFiles: [
            src('**/*.jsx'),
            src('index.jsx')
        ],
        reloadOn: [
            app('css/*.css'),
            app('js/*.js'),
            app('main*.js'),
            app('index.html')
        ]
    };

gulp.task('build:app', ['clean:app'], () => {
    let electron = require('gulp-electron'),
        pkg = require(app('package.json')),
        iconPath = app('img/icon256');

    gulp.src('')
        .pipe(electron({
            src: app(),
            packageJson: pkg,
            release: paths.desktopApp,
            cache: './cache',
            rebuild: false,
            packaging: true,
            asar: true,
            version: 'v' + electronVersion,
            platforms: [
                'win32-ia32',
                'win32-x64',
                'darwin-x64'
            ],
            platformResources: {
                darwin: {
                    icon: iconPath + '.icns',
                    CFBundleDisplayName: pkg.title,
                    CFBundleIdentifier: pkg.name,
                    CFBundleName: pkg.name,
                    CFBundleVersion: pkg.version
                },
                win: {
                    icon: iconPath + '.ico',
                    'version-string': pkg.version,
                    'file-version': pkg.version,
                    'product-version': pkg.version
                }
            }
        }))
        .pipe(gulp.dest(''));
});

gulp.task('build:ui-vendor', () => {
	return gulp.src([
        vendor('react/dist/react-with-addons.js'),
        vendor('react-dom/dist/react-dom.js')
    ])
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(paths.js));
});

gulp.task('build:ui', ['build:ui-vendor'], () => {
	return gulp.src(paths.srcFiles)
        .pipe(babel({
            presets: ['es2015', 'react', 'stage-1'],
            plugins: ['transform-decorators-legacy'],
            sourceRoot: paths.src
        }))
		.pipe(concat('index.js'))
		.pipe(gulp.dest(paths.js));
});

gulp.task('clean:app', () => {
    let del = require('del');

    return del([
        paths.desktopApp + '/**/*'
    ]);
});

gulp.task('build', ['build:ui', 'build:app']);
gulp.task('default', ['build']);
