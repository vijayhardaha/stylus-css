/**
 * Define required packages.
 */
const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const del = require("del");
const duplicates = require("postcss-discard-duplicates");
const plumber = require("gulp-plumber");
const replace = require("gulp-replace");
const postcss = require("gulp-postcss");
const sass = require("gulp-sass")(require("sass"));

/**
 * Define domain for @-moz-document
 *
 * Sass creates a Deprecation Warning for @-moz-document
 * I was unable to find any solution to quiet the warning.
 * But they made exception for url-prefix() so I am replacing
 * url-prefix() with the domain in final CSS output.
 *
 * So this is a quick hack.
 *
 * @see https://sass-lang.com/documentation/breaking-changes/moz-document
 */
const domainRegexs = {
	"stackoverflow.css": 'domain("stackoverflow.com")',
	"wordpress.css": 'domain("wordpress.org")',
};

/**
 * Destination directory path with slash.
 */
const DEST = "css/";

/**
 * Build CSS.
 *
 * @param {Function} done
 */
const buildCSS = (done) => {
	gulp.src("./src/*.scss")
		.pipe(plumber())
		.pipe(sass({ outputStyle: "expanded" }))
		.pipe(postcss([duplicates(), autoprefixer()]))
		.pipe(
			replace("url-prefix()", function handleReplace(match) {
				return domainRegexs?.[this.file.relative] || match;
			})
		)
		.pipe(gulp.dest(DEST));

	done();
};

/**
 * Clean the build directory.
 *
 * @param {Function} done
 */
const cleanAssets = (done) => {
	del.sync(DEST);

	done();
};

/**
 * Runs parallel tasks for .js compiling with webpack and .scss compiling
 *
 * @param {Function} done
 */
const watchAssets = (done) => {
	gulp.watch("src/**/*.scss", gulp.series(buildCSS));
	done();
};

gulp.task("build", gulp.series(cleanAssets, buildCSS));
gulp.task("watch", gulp.series(watchAssets));
