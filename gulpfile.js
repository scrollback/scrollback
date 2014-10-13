// Load plugins and declare variables
var gulp = require("gulp"),
	bower = require("bower"),
	browserify = require("browserify"),
	source = require("vinyl-source-stream"),
	es = require("event-stream"),
	plumber = require("gulp-plumber"),
	gutil = require("gulp-util"),
	streamify = require("gulp-streamify"),
	jshint = require("gulp-jshint"),
	concat = require("gulp-concat"),
	striplog = require("gulp-strip-debug"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	sass = require("gulp-ruby-sass"),
	autoprefixer = require("gulp-autoprefixer"),
	minify = require("gulp-minify-css"),
	manifest = require("gulp-manifest"),
	rimraf = require("gulp-rimraf"),
	config = require("./config.js"),
	clientConfig = require("./client-config.js"),
	debug = !(gutil.env.production || config.env === "production"),
	bowerDir = "bower_components",
	libDir = "public/s/scripts/lib",
	laceDir = "public/s/styles/lace",
	cssDir = "public/s/styles/dist",
	jsFiles = [
		"*/*-client.js",
		"lib/*.js", "ui/*.js",
		"public/client.js", "public/libsb.js", "client-init/*.js",
		"client-entityloader/*.js", "localStorage/*.js", "socket/*.js", "interface/*.js",
		"calls-to-action/*.js"
	],
	cssFiles = [ "public/s/styles/scss/*.scss" ];

// Make browserify bundle
function bundle(files, opts) {
	var streams = [],
		bundler = function(file) {
			opts.entries = "./" + file;

			return browserify(opts).bundle()
			.pipe(source(file.split(/[\\/]/).pop()))
			.on("error", gutil.log);
		};

	opts = opts || {};

	if (files && files instanceof Array) {
		for (var i = 0, l = files.length; i < l; i++) {
			if (typeof files[i] === "string") {
				streams.push(bundler(files[i]));
			}
		}
	} else if (typeof files === "string") {
		streams.push(bundler(files));
	}

	return es.merge.apply(null, streams);
}

// Add prefix in an array
function prefix(str, arr) {
	var prefixed = [];

	if (!(arr && arr instanceof Array)) {
		return arr;
	}

	for (var i = 0, l = arr.length; i < l; i++) {
		prefixed.push(str + arr[i]);
	}

	return prefixed;
}

// Lint JavaScript files
gulp.task("lint", function() {
	return gulp.src([
		"*/*{.js,/*.js,/*/*.js}",
		"!*/*{.min.js,/*.min.js,/*/*.min.js}",
		"!node_modules{,/**}", "!bower_components{,/**}"
	])
	.pipe(plumber())
	.pipe(jshint())
	.pipe(jshint.reporter("jshint-stylish"))
	.on("error", gutil.log);
});

// Install and copy third-party libraries
gulp.task("bower", function() {
	return bower.commands.install([], { save: true }, {})
	.on("error", gutil.log);
});

gulp.task("libs", [ "bower" ], function() {
	return gulp.src(prefix(bowerDir + "/", [
		"jquery/dist/jquery.min.js",
		"lace/src/js/*.js",
		"sockjs/sockjs.min.js",
		"svg4everybody/svg4everybody.min.js",
		"velocity/jquery.velocity.min.js",
		"velocity/velocity.ui.min.js"
	]))
	.pipe(plumber())
	.pipe(gulp.dest(libDir))
	.on("error", gutil.log);
});

// Copy and minify polyfills
gulp.task("polyfills", [ "bower" ], function() {
	return gulp.src(prefix(bowerDir + "/", [
		"flexie/dist/flexie.min.js",
		"transformie/transformie.js"
	]))
	.pipe(plumber())
	.pipe(concat("polyfills.js"))
	.pipe(!debug ? streamify(uglify()) : gutil.noop())
	.pipe(!debug ? streamify(striplog()) : gutil.noop())
	.pipe(gulp.dest(libDir))
	.pipe(rename({ suffix: ".min" }))
	.pipe(gulp.dest(libDir))
	.on("error", gutil.log);
});

// Build browserify bundles
gulp.task("bundle", [ "libs" ], function() {
	return bundle([ "libsb.js", "client.js" ], { debug: debug })
	.pipe(plumber())
	.pipe(!debug ? streamify(uglify()) : gutil.noop())
	.pipe(!debug ? streamify(striplog()) : gutil.noop())
	.pipe(rename({ suffix: ".bundle.min" }))
	.pipe(gulp.dest("public/s/scripts"))
	.on("error", gutil.log);
});

// Generate embed widget script
gulp.task("embed", function() {
	return bundle("embed/embed-parent.js", { debug: debug })
	.pipe(plumber())
	.pipe(!debug ? streamify(uglify()) : gutil.noop())
	.pipe(!debug ? streamify(striplog()) : gutil.noop())
	.pipe(rename("embed.min.js"))
	.pipe(gulp.dest("public"))
	.pipe(rename("client.min.js"))
	.pipe(gulp.dest("public"))
	.on("error", gutil.log);
});

// Generate scripts
gulp.task("scripts", [ "polyfills", "bundle", "embed" ]);

// Generate styles
gulp.task("lace", [ "bower" ], function() {
	return gulp.src(bowerDir + "/lace/src/scss/*.scss")
	.pipe(plumber())
	.pipe(gulp.dest(laceDir))
	.on("error", gutil.log);
});

gulp.task("styles", [ "lace" ], function() {
	return gulp.src(cssFiles)
	.pipe(sass({
		style: !debug ? "compressed" : "expanded",
		sourcemapPath: "../scss"
	}))
	.pipe(plumber())
	.on("error", function(e) { gutil.log(e.message); })
	.pipe(!debug ? (autoprefixer() && minify()) : gutil.noop())
	.pipe(gulp.dest(cssDir))
	.on("error", gutil.log);
});

// Generate appcache manifest file
gulp.task("manifest", function() {
	var protocol = clientConfig.server.protocol,
		host = clientConfig.server.host,
		domain = protocol + host;

	return gulp.src(prefix("public/s/", [
		"lib/jquery.min.js",
		"scripts/client.bundle.min.js",
		"styles/dist/client.css",
		"img/client/**/*"
	]))
	.pipe(manifest({
		basePath: "public",
		prefix: domain,
		cache: [
			domain + "/client.html",
			protocol + "//fonts.googleapis.com/css?family=Open+Sans:400,600",
			protocol + "//fonts.gstatic.com/s/opensans/v10/cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw.woff",
			protocol + "//fonts.gstatic.com/s/opensans/v10/MTP_ySUJH_bn48VBG8sNSnhCUOGz7vYGh680lGh-uXM.woff"
		],
		network: [ "*" ],
		fallback: [
			protocol + "//gravatar.com/avatar/ " + domain + "/s/img/client/avatar-fallback.svg",
			domain + "/socket " + domain + "/s/socket-fallback",
			domain + "/ " + domain + "/client.html"
		],
		preferOnline: true,
		hash: true,
		filename: "manifest.appcache"
	}))
	.pipe(gulp.dest("public"))
	.on("error", gutil.log);
});

// Clean up generated files
gulp.task("clean", function() {
	return gulp.src([
		"public/{*.map,**/*.map}",
		"public/{*.min.js,**/*.min.js}",
		"public/{*.bundle.js,**/*.bundle.js}",
		"public/{*.appcache,**/*.appcache}",
		libDir, cssDir, laceDir
	], { read: false })
	.pipe(plumber())
	.pipe(rimraf())
	.on("error", gutil.log);
});

gulp.task("watch", function() {
	gulp.watch(jsFiles, [ "scripts", "manifest" ]);
	gulp.watch(cssFiles, [ "styles", "manifest" ]);
});

// Default Task
gulp.task("default", [ "scripts", "styles", "manifest" ]);
