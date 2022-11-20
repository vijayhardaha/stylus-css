/**
 * Define required packages.
 */
import { deleteSync } from "del";
import autoprefixer from "autoprefixer";
import cleancss from "gulp-clean-css";
import dartSass from "sass";
import duplicates from "postcss-discard-duplicates";
import gulp from "gulp";
import gulpSass from "gulp-sass";
import plumber from "gulp-plumber";
import postcss from "gulp-postcss";
import rename from "gulp-rename";
import replace from "gulp-replace";

const sass = gulpSass(dartSass);

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
const DEST = "dist/";

/**
 * Build CSS.
 *
 * @param {Function} done
 */
const buildCSS = (done) => {
	const entries = [
		"./src/stackoverflow/stackoverflow.scss",
		"./src/wordpress/wordpress.scss",
	];

	gulp.src(entries)
		.pipe(plumber())
		.pipe(sass({ outputStyle: "expanded" }))
		.pipe(postcss([duplicates(), autoprefixer()]))
		.pipe(
			replace("url-prefix()", function handleReplace(match) {
				return domainRegexs?.[this.file.relative] || match;
			})
		)
		.pipe(cleancss({ format: "beautify" }))
		.pipe(rename({ suffix: ".user" }))
		.pipe(gulp.dest(DEST));

	done();
};

/**
 * Clean the build directory.
 *
 * @param {Function} done
 */
const cleanAssets = (done) => {
	deleteSync(DEST);

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

const build = gulp.series(cleanAssets, buildCSS);
const watcher = gulp.series(watchAssets);

export { build };
export { watcher as watch };
