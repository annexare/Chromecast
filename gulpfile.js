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
    exec = require('child_process').execSync,
    isOSX = (process.platform === 'darwin'),
    packager = require('electron-packager'),
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

let getPackagerParams = (platform) => {
    let pkg = require(app('package.json')),
        params = {
            arch: 'all',
            asar: true,
            cache: './cache',
            dir: app(),
            icon: app('img/icon256'),
            name: pkg.name,
            out: paths.desktopApp,
            overwrite: true,
            platform: platform,
            prune: true,
            version: pkg.electronVersion,
            'app-version': pkg.version,
            'app-copyright': pkg.author,
            'build-version': pkg.version
        };

    if (platform === 'darwin') {
        params['app-category-type'] = 'public.app-category.video';
    } else if (platform === 'win32') {
        params['version-string'] = {
            CompanyName: pkg.author,
            FileDescription: pkg.description,
            ProductVersion: pkg.version,
            InternalName: pkg.productName

            // Deprecated
            // FileVersion: pkg.version,
            // ProductName: pkg.productName,
        };
    }

    return params;
};

let packagingDone = (err, appPaths, cb) => {
    if (err) {
        console.log('Error: ', err);

        return cb();
    }

    if (Array.isArray(appPaths)) {
        appPaths.forEach(appPath => {
            if (isOSX) {
                if (/darwin/.test(appPath)) {
                    exec(`hdiutil create -format UDZO -srcfolder ${appPath} ${appPath}.dmg`);
                    console.log(`DMG file created: "${appPath}.dmg"\n`);
                } else {
                    let pathInfo = require('path').parse(appPath);
                    exec(`zip -r ${pathInfo.base}.zip ${pathInfo.base}`, {
                        cwd: pathInfo.dir
                    });
                    console.log(`ZIP archive created: "${appPath}.zip"\n`);
                }
            } else {
                console.log(`Archiving for this platform is not ready yet (${appPath}).`);
            }
        });
    }

    cb();
};

let packaging = (cb, platform) => {
    packager(
        getPackagerParams(platform),
        (err, appPaths) => packagingDone(err, appPaths, cb)
    );
};

gulp.task('build:ui-vendor', () => {
	return gulp.src([
        vendor('react/dist/react-with-addons.js'),
        vendor('react-dom/dist/react-dom.js')
    ])
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(paths.js));
});

gulp.task('build:ui', () => {
    // process.env.NODE_ENV = 'production';

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

gulp.task('build:app:osx', (cb) => packaging(cb, 'darwin'));
gulp.task('build:app:win', (cb) => packaging(cb, 'win32'));
gulp.task('build:app', ['clean:app', 'build:app:osx', 'build:app:win']);
gulp.task('build', ['build:ui', 'build:app']);

gulp.task('default', ['build']);
