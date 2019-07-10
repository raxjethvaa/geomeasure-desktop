var gulp = require('gulp');
var electron = require('gulp-electron');
var packageJson = require('./package.json');
 
gulp.task('electron', function() {
 
    gulp.src("")
    .pipe(electron({
        src: './src',
        packageJson: packageJson,
        release: './release',
        cache: './cache',
        version: 'v0.1.3',
        packaging: true,
        // token: 'abc123...',
        platforms: ['win32-ia32', 'darwin-x64'],
        platformResources: {
            // darwin: {
            //     CFBundleDisplayName: packageJson.name,
            //     CFBundleIdentifier: packageJson.name,
            //     CFBundleName: packageJson.name,
            //     CFBundleVersion: packageJson.version,
            //     icon: 'gulp-electron.icns'
            // },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version,
                "icon": 'appIcon/logo_gmcav2trans_UqB_icon.ico',
                "nsiTemplate" : "appIcon/nsi-template/installer.nsi.tpl"
            }
        }
    }))
    .pipe(gulp.dest(""));
});

// 'use strict';
// var gulp = require('gulp');
// var replace = require('gulp-replace');
// var path = require('path');

// var constant = {
//     cwd: process.env.INIT_CWD || '',
//     nsiTemplate: 'appIcon/nsi-template/include/',
//     fileAssociation: {
//         extension: '.kml',
//         fileType: '*'
//     }
// };

// // task to generate nsi-template for windows
// gulp.task('nsi-template', function () {
//     var projectIncludeDir = path.join(constant.cwd, constant.nsiTemplate);
//     return gulp.src('nsi-template/installer.nsi.tpl')
//         .pipe(replace('@projectIncludeDir', projectIncludeDir))
//         .pipe(replace('@projectExtension', constant.fileAssociation.extension))
//         .pipe(replace('@projectFileType', constant.fileAssociation.fileType))
//         .pipe(gulp.dest('dist/nsi-template/win'));
// });
