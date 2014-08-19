/* jshint node: true */

// Load plugins and declare variables
var gulp = require("gulp"),
	browserify = require("browserify"),
	source = require("vinyl-source-stream"),
	eventstream = require("event-stream"),
	gutil = require("gulp-util"),
	streamify = require("gulp-streamify"),
	jshint = require("gulp-jshint"),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	sass = require("gulp-ruby-sass"),
	prefix = require("gulp-autoprefixer"),
	minify = require("gulp-minify-css"),
	manifest = require("gulp-manifest"),
	rimraf = require("gulp-rimraf"),
	bowerDir = "bower_components",
	libDir = "public/s/lib",
	cssDir = "public/s/styles/gen",
	jsFiles = [
		"*/*-client.js",
		"lib/*.js", "ui/*.js",
		"public/client.js", "public/libsb.js"
	],
	cssFiles = [ "public/s/styles/scss/*.scss" ];

// Make browserify bundle
function bundle(files, opts) {
	var streams = [],
		bundler = function(file) {
			opts.entries = "./" + file;

			return browserify(opts).bundle()
			.pipe(source(file))
			.on("error", gutil.log);
		};

	if (files instanceof Array) {
		for (var i = 0, l = files.length; i < l; i++) {
			streams.push(bundler(files[i]));
		}
	} else if (typeof files === "string") {
		streams.push(bundler(files));
	}

	return eventstream.merge.apply(null, streams);
}

// Lint JavaScript files
gulp.task("lint", function() {
	return gulp.src([
		"*/*{.js,/*.js,/*/*.js}",
		"!*/*{.min.js,/*.min.js,/*/*.min.js}",
		"!node_modules{,/**}", "!bower_components{,/**}"
	])
	.pipe(jshint())
	.pipe(jshint.reporter("jshint-stylish"));
});

// Copy and minify polyfills
gulp.task("polyfills", function() {
	return gulp.src([
		bowerDir + "/flexie/dist/flexie.min.js",
		bowerDir + "/transformie/transformie.js"
	])
	.pipe(concat("polyfills.js"))
	.pipe(gutil.env.production ? streamify(uglify()) : gutil.noop())
	.pipe(gulp.dest(libDir))
	.pipe(rename({ suffix: ".min" }))
	.pipe(gulp.dest(libDir))
	.on("error", gutil.log);
});

// Copy libs and build browserify bundles
gulp.task("libs", function() {
	return gulp.src([
		bowerDir + "/jquery/dist/jquery.min.js",
		bowerDir + "/sockjs/sockjs.min.js",
		bowerDir + "/svg4everybody/svg4everybody.min.js",
		bowerDir + "/velocity/jquery.velocity.min.js",
		bowerDir + "/velocity/velocity.ui.min.js"
	])
	.pipe(gulp.dest(libDir))
	.on("error", gutil.log);
});

gulp.task("bundle", [ "libs" ], function() {
	return bundle([ "libsb.js", "client.js" ], { debug: !gutil.env.production })
	.pipe(gutil.env.production ? streamify(uglify()) : gutil.noop())
	.pipe(rename({ suffix: ".bundle.min" }))
	.pipe(gulp.dest("public"))
	.on("error", gutil.log);
});

// Generate embed widget script
gulp.task("embed", function() {
	return bundle("embed/embed-widget.js", { debug: !gutil.env.production })
	.pipe(gutil.env.production ? streamify(uglify()) : gutil.noop())
	.pipe(rename("embed.min.js"))
	.pipe(gulp.dest("public"))
	.pipe(rename("client.min.js"))
	.pipe(gulp.dest("public"))
	.on("error", gutil.log);
});

// Generate scripts
gulp.task("scripts", [ "polyfills", "bundle", "embed" ]);

// Generate appcache manifest file
gulp.task("manifest", function() {
	return gulp.src([
		"public/**/*",
		"!public/{**/*.html,t/**}",
		"!public/s/{*,js/*,img/*,img/covers/*,styles/scss/*}"
	])
	.pipe(manifest({
		cache: [
			"//fonts.googleapis.com/css?family=Open+Sans:300,400,600",
			"//themes.googleusercontent.com/font?kit=cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw"
		],
		network: [ "*" ],
		fallback: [
			"//gravatar.com/avatar/ /s/img/client/avatar-fallback.svg",
			"/ /offline.html",
			"/socket /s/socket-fallback"
		],
		preferOnline: true,
		hash: true,
		filename: "manifest.appcache"
	}))
	.pipe(gulp.dest("public"))
	.on("error", gutil.log);
});

// Generate styles
gulp.task("styles", function() {
	return gulp.src(cssFiles)
	.pipe(sass({
		style: "expanded",
		sourcemapPath: "../scss"
	}))
	.on("error", function(e) { gutil.log(e.message); })
	.pipe(gutil.env.production ? (prefix() && minify()) : gutil.noop())
	.pipe(gulp.dest(cssDir))
	.on("error", gutil.log);
});

gulp.task("clean", function() {
	return gulp.src([
		"public/*.map",
		"public/*.min.js",
		"public/*.bundle.js",
		"public/manifest.appcache",
		libDir, cssDir
	], { read: false })
	.pipe(rimraf())
	.on("error", gutil.log);
});

gulp.task("watch", function() {
	gulp.watch(jsFiles, [ "scripts", "manifest" ]);
	gulp.watch(cssFiles, [ "styles", "manifest" ]);
});

// Default Task
gulp.task("default", [ "scripts", "styles", "manifest" ]);
