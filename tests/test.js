var libx = require('../bundles/essentials.js');
var gulp = require('../node/gulp');
var rx = require('../modules/rxjs');

/*
const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const transform = require('vinyl-transform');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
*/

const path = require('path');

(async ()=>{ /* init */
	// libx._.each([1,2,3,4,5], i=> libx.log.v(i))
	//libx.log.v(rx)
	// rx.range(1, 200).pipe(
	// 	rx.Operators.filter(x => x % 2 === 1),
	// 	rx.Operators.map(x => x + x)
	// ).subscribe(x => libx.log.v(x));
	

	await gulp.delete('./temp/');
	await gulp.copy('./bundles/essentials.js', './temp/', ()=>[ // '../test/build/resources/scripts/'
		gulp.middlewares.browserify({ }),
		gulp.middlewares.ifProd(gulp.middlewares.minify()),
	]);

	/*
	const gulp = require('gulp');
	const browserify = require('browserify');
	const source = require('vinyl-source-stream');
	const buffer = require('vinyl-buffer');
	const sourcemaps = require('gulp-sourcemaps');
	const uglify = require('gulp-uglify');
	const minify = require("gulp-babel-minify");

	var getBundleName = function () {
		var version = require('./package.json').version;
		var name = require('./package.json').name;
		return version + '.' + name + '.' + 'min';
	};
	   

	var bundler = browserify({
		entries: ['./bundles/essentials.js'],
		debug: false
	});
	 
	var bundle = function() {
	return bundler
		.bundle()
		.pipe(source('out.js')) //getBundleName() + '.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		// Add transformation tasks to the pipeline here.
		// .pipe(minify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./temp/'));
	};

	bundle();
	*/

	libx.log.i('done')
})();
