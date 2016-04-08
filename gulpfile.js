/**
 * Gulp tasks.
 */

'use strict';

let app = (path) => {
    return './app/' + (path || '');
};

let src = (path) => {
    return './jsx/' + (path || '');
};

let vendor = (path) => {
    return './node_modules/' + (path || '');
};

const
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

gulp.task('build:app', ['clean:app'], (cb) => {
    let packager = require('electron-packager'),
        pkg = require(app('package.json')),
        opts = {
            arch: 'all',
            asar: true,
            cache: './cache',
            dir: app(),
            icon: app('img/icon256'),
            name: pkg.name,
            out: paths.desktopApp,
            overwrite: true,
            platform: 'win32,darwin',
            prune: true,
            version: pkg.electronVersion,
            'app-version': pkg.version,
            'app-category-type': 'public.app-category.video',
            'app-copyright': pkg.author,
            'build-version': pkg.version,
            'version-string': {
                CompanyName: pkg.author,
                FileDescription: pkg.description,
                FileVersion: pkg.version,
                ProductVersion: pkg.version,
                ProductName: pkg.productName,
                InternalName: pkg.productName,
            }
        };

    packager(opts, (err, appPaths) => {
        if (err) {
            console.log('Error: ', err);
            cb();
        } else {
            // const archiver = require('archiver'),
            //     fs = require('fs');

            if (Array.isArray(appPaths)) {
                // let archiveCount = 0;

                appPaths.forEach(appPath => {
                    console.log('App path: ', appPath);

                    // let archive = archiver.create('zip'),
                    //     archivePath = appPath + '.zip',
                    //     file = fs.createWriteStream(archivePath);

                    // file.on('close', () => {
                    //     archiveCount++;
                    //     console.log(archive.pointer() + ' total bytes');

                    //     if (archiveCount === appPaths.length) {
                    //         cb();
                    //     }
                    // });
                    // archive.on('error', (err) => {
                    //     throw err;
                    // });

                    // archive.pipe(file);
                    // archive.bulk([
                    //     {
                    //         expand: true,
                    //         cwd: appPath,
                    //         src: ['**/*'],
                    //         dot: true
                    //     }
                    // ]);
                    // archive.finalize();
                });

                cb();
            }
        }
    });
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
