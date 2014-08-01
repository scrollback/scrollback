/* jshint node: true */

var gulp = require("gulp"),
	jshint = require("gulp-jshint"),
	browserify = require("gulp-browserify"),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	sass = require("gulp-ruby-sass"),
	prefix = require("gulp-autoprefixer"),
	manifest =  require("gulp-manifest"),
	clean = require("gulp-clean"),
	bowerDir = "bower_components",
    libDir = "public/s/lib",
    cssDir = "public/s/styles/gen",
	jsFiles = [
		"*/*-client.js",
		"lib/*.js", "ui/*.js",
		"public/client.js", "public/libsb.js"
	],
    cssFiles = [
        "public/s/styles/scss/*.scss"
    ];

function prefixArray(prefix, array) {
    var prefixed = [];

    for (var i = 0, l = array.length; i < l; i++) {
        prefixed.push(prefix + array[i]);
    }

    return prefixed;
}

// Lint JavaScript files
gulp.task("lint", function() {
	return gulp.src(jsFiles)
	.pipe(jshint())
	.pipe(jshint.reporter("jshint-stylish"));
});

// Copy and minify polyfills
gulp.task("polyfills", function() {
	return gulp.src(prefixArray(bowerDir, [
        "/flexie/dist/flexie.min.js",
        "/transformie/transformie.js"
	]))
	.pipe(concat("polyfills.js"))
	.pipe(uglify())
	.pipe(rename({ suffix: ".min" }))
	.pipe(gulp.dest(libDir));
});

// Copy libs and build browserify bundles
gulp.task("libs", function() {
    return gulp.src(prefixArray(bowerDir, [
		"/jquery/dist/jquery.min.js",
		"/sockjs/sockjs.min.js",
		"/svg4everybody/svg4everybody.min.js",
		"/velocity/jquery.velocity.min.js",
		"/velocity/velocity.ui.min.js"
	]))
	.pipe(gulp.dest(libDir));
});

gulp.task("browserify", [ "libs" ], function() {
	return gulp.src([ "client.js", "libsb.js" ])
	.pipe(browserify({
		bundleOptions: { debug: true }
	}))
	.pipe(uglify({ sourceMap: true }))
	.pipe(rename({ suffix: ".bundle.min" }))
	.pipe(gulp.dest("public"));
});

// Generate embed widget script
gulp.task("embed", function() {
	return gulp.src("embed/embed-widget.js")
	.pipe(browserify({
		bundleOptions: { debug: true }
	}))
	.pipe(uglify({ sourceMap: true }))
	.pipe(rename("embed.min.js"))
	.pipe(gulp.dest("public"))
	.pipe(rename("client.min.js"))
	.pipe(gulp.dest("public"));
});

// Generate appcache manifest file
gulp.task("manifest", function() {
    return gulp.src(prefixArray("public", [
		"/client.bundle.min.js",
		"/s/lib/jquery.min.js",
		"/s/styles/gen/*.css",
		"/s/img/client/*.*",
		"/s/img/client/*/*.*"
	]))
	.pipe(manifest({
		basePath: "public",
		cache: [
            "//fonts.googleapis.com/css?family=Open+Sans:300,400,600",
            "//themes.googleusercontent.com/font?kit=cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw"
        ],
		network: [ "*" ],
		fallback: [ "//gravatar.com/avatar/ /s/img/client/avatar-fallback.svg",  "/ /offline.html" ],
		preferOnline: true,
		timestamp: true,
		filename: "manifest.appcache"
	}))
	.pipe(gulp.dest("public"));
});

gulp.task("styles", function() {
    return gulp.src(cssFiles)
	.pipe(sass({
		style: "compressed",
		sourcemap: true
	}))
	.on("error", function(e) { console.log(e.message); })
	.pipe(prefix())
	.pipe(gulp.dest(cssDir));
});

gulp.task("clean", function() {
	return gulp.src([
        "public/*.min.js",
        "public/manifest.appcache",
        libDir, cssDir
    ], { read: false })
	.pipe(clean());
});

gulp.task("watch", function() {
	gulp.watch(jsFiles, [ "lint", "browserify", "embed", "manifest" ]);
    gulp.watch(cssFiles, [ "styles", "manifest" ]);
});

// Default Task
gulp.task("default", [ "lint", "polyfills", "browserify", "embed", "styles", "manifest" ]);
