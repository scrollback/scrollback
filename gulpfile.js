/* jshint node:true */
// Load plugins and declare variables
var gulp = require("gulp"),
	del = require("del"),
	bower = require("bower"),
	browserify = require("browserify"),
	source = require("vinyl-source-stream"),
	buffer = require("vinyl-buffer"),
	es = require("event-stream"),
	lazypipe = require("lazypipe"),
	plumber = require("gulp-plumber"),
	gutil = require("gulp-util"),
	jshint = require("gulp-jshint"),
	gitmodified = require("gulp-gitmodified"),
	symlink = require("gulp-sym"),
	concat = require("gulp-concat"),
	striplogs = require("gulp-strip-debug"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	sass = require("gulp-ruby-sass"),
	autoprefixer = require("gulp-autoprefixer"),
	minify = require("gulp-minify-css"),
	manifest = require("gulp-manifest"),
	config = require("./config.js"),
	clientConfig = require("./client-config.js"),
	debug = !(gutil.env.production || config.env === "production"),
	dirs = {
		bower: "bower_components",
		lib: "public/s/scripts/lib",
		lace: "public/s/styles/lace",
		css: "public/s/styles/dist"
	},
	files = {
		js: [
			"*/*{.js,/**/*.js}",
			"!*/*{.min.js,/**/*.min.js}",
			"!node_modules{,/**}", "!bower_components{,/**}",
            "!public/phonegap/**"
		],
		css: [ "public/s/styles/scss/*.scss" ]
	};

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

	return es.merge.apply(null, streams).pipe(buffer());
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

// Lazy pipe for building scripts
var buildscripts = lazypipe()
	.pipe(plumber)
	.pipe(!debug ? uglify : gutil.noop)
	.pipe(!debug ? striplogs : gutil.noop);

// Install the GIT hooks
gulp.task("hooks", function() {
	return gulp.src([ ".git-hooks/pre-commit", ".git-hooks/post-merge" ])
	.pipe(symlink([ ".git/hooks/pre-commit", ".git/hooks/post-merge" ], {
		relative: true,
		force: true
	}));
});

// npm post-install hooks
gulp.task("postinstall", [ "hooks" ]);

// Lint JavaScript files
gulp.task("lint", function() {
	return gulp.src(files.js)
	.pipe(plumber())
	.pipe(gitmodified("modified"))
	.pipe(jshint())
	.pipe(jshint.reporter("jshint-stylish"))
	.pipe(jshint.reporter("fail"))
	.on("error", gutil.log);
});

// Install and copy third-party libraries
gulp.task("bower", function() {
	return bower.commands.install([], { save: true }, {})
	.on("error", gutil.log);
});

gulp.task("libs", [ "bower" ], function() {
	return gulp.src(prefix(dirs.bower + "/", [
		"jquery/dist/jquery.min.js",
		"lace/src/js/*.js",
		"sockjs/sockjs.min.js",
		"svg4everybody/svg4everybody.min.js",
		"velocity/jquery.velocity.min.js",
		"velocity/velocity.ui.min.js"
	]))
	.pipe(plumber())
	.pipe(gulp.dest(dirs.lib))
	.on("error", gutil.log);
});

// Copy and minify polyfills
gulp.task("polyfills", [ "bower" ], function() {
	return gulp.src(prefix(dirs.bower + "/", [
		"flexie/dist/flexie.min.js",
		"transformie/transformie.js"
	]))
	.pipe(buildscripts())
	.pipe(concat("polyfills.js"))
	.pipe(gulp.dest(dirs.lib))
	.pipe(rename({ suffix: ".min" }))
	.pipe(gulp.dest(dirs.lib))
	.on("error", gutil.log);
});

// Build browserify bundles
gulp.task("bundle", [ "libs" ], function() {
	return bundle([ "libsb.js", "client.js" ], { debug: debug })
	.pipe(buildscripts())
	.pipe(rename({ suffix: ".bundle.min" }))
	.pipe(gulp.dest("public/s/scripts"))
	.on("error", gutil.log);
});

// Generate embed widget script
gulp.task("embed", function() {
	return bundle("embed/embed-parent.js", { debug: debug })
	.pipe(buildscripts())
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
	return gulp.src(dirs.bower + "/lace/src/scss/*.scss")
	.pipe(plumber())
	.pipe(gulp.dest(dirs.lace))
	.on("error", gutil.log);
});

gulp.task("styles", [ "lace" ], function() {
	return gulp.src(files.css)
	.pipe(sass({
		style: !debug ? "compressed" : "expanded",
		sourcemapPath: "../scss"
	}))
	.on("error", function(e) { gutil.log(e.message); })
	.pipe(plumber())
	.pipe(!debug ? autoprefixer() : gutil.noop())
	.pipe(!debug ? minify() : gutil.noop())
	.pipe(gulp.dest(dirs.css))
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
		timestamp: true,
		filename: "manifest.appcache"
	}))
	.pipe(gulp.dest("public"))
	.on("error", gutil.log);
});

gulp.task("android-manifest", function() {
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
			protocol + "//fonts.googleapis.com/css?family=Open+Sans:400,600",
			protocol + "//fonts.gstatic.com/s/opensans/v10/cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw.woff",
			protocol + "//fonts.gstatic.com/s/opensans/v10/MTP_ySUJH_bn48VBG8sNSnhCUOGz7vYGh680lGh-uXM.woff"
		],
		network: [ "*" ],
		fallback: [
			protocol + "//gravatar.com/avatar/ " + domain + "/s/img/client/avatar-fallback.svg",
			domain + "/socket " + domain + "/s/socket-fallback?platform=android",
			domain + "/ " + domain + "/client.html?platform=android"
		],
		preferOnline: true,
		timestamp: true,
		filename: "androidmanifest.appcache"
	}))
	.pipe(gulp.dest("public"))
	.on("error", gutil.log);
});

// Clean up generated files
gulp.task("clean", function() {
	return del([
		"public/{*.map,**/*.map}",
		"public/{*.min.js,**/*.min.js}",
		"public/{*.bundle.js,**/*.bundle.js}",
		"public/{*.appcache,**/*.appcache}",
		dirs.lib, dirs.css, dirs.lace
	]);
});

gulp.task("watch", function() {
	gulp.watch(files.js, [ "scripts", "manifest", "android-manifest" ]);
	gulp.watch(files.css, [ "styles", "manifest", "android-manifest" ]);
});

// Default Task
gulp.task("default", [ "lint", "scripts", "styles", "manifest", "android-manifest" ]);
