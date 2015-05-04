// Load plugins and declare variables

"use strict";

var gulp = require("gulp"),
	del = require("del"),
	bower = require("bower"),
	browserify = require("browserify"),
	reactify = require("reactify"),
	source = require("vinyl-source-stream"),
	buffer = require("vinyl-buffer"),
	es = require("event-stream"),
	lazypipe = require("lazypipe"),
	plumber = require("gulp-plumber"),
	notify = require("gulp-notify"),
	gutil = require("gulp-util"),
	sourcemaps = require("gulp-sourcemaps"),
	jshint = require("gulp-jshint"),
	jscs = require("gulp-jscs"),
	gitmodified = require("gulp-gitmodified"),
	symlink = require("gulp-sym"),
	concat = require("gulp-concat"),
	striplogs = require("gulp-strip-debug"),
	removestrict = require("gulp-remove-use-strict"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	sass = require("gulp-sass"),
	combinemq = require("gulp-combine-mq"),
	autoprefixer = require("gulp-autoprefixer"),
	minify = require("gulp-minify-css"),
	manifest = require("gulp-manifest"),
	config = require("./server-config-defaults.js"),
	debug = !(gutil.env.production || config.env === "production"),
	onerror = notify.onError("Error: <%= error.message %>"),
	dirs = {
		bower: "bower_components",
		scss: "public/s/styles/scss",
		css: "public/s/dist/styles",
		fonts: "public/s/dist/fonts",
		scripts: "public/s/dist/scripts"
	},
	files = {
		js: [
			"**/*.js", "!**/*.min.js",
			"!node_modules/**", "!bower_components/**",
			"!public/s/**/*.js"
		],
		jsx: [ "**/*.jsx" ],
		scss: [ "public/s/styles/scss/**/*.scss" ]
	};

// Make browserify bundle
function bundle(files, opts) {
	var streams = [],
		bundler = function(file) {
			opts.entries = "./" + file;

			return browserify(opts).bundle()
			.on("error", function(error) {
				onerror(error);

				// End the stream to prevent gulp from crashing
				this.end();
			})
			.pipe(source(file.split(/[\\/]/).pop()));
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
function prefix(str, arr, extra) {
	var prefixed = [];

	if (!(arr && arr instanceof Array)) {
		return arr;
	}

	for (var i = 0, l = arr.length; i < l; i++) {
		prefixed.push(str + arr[i]);
	}

	if (extra) {
		if (extra instanceof Array) {
			prefixed.concat(extra);
		} else {
			prefixed.push(extra);
		}
	}

	return prefixed;
}

// Lazy pipe for building scripts
var buildscripts = lazypipe()
	.pipe(plumber, { errorHandler: onerror })
	.pipe(!debug ? uglify : gutil.noop)
	.pipe(!debug ? removestrict : gutil.noop)
	.pipe(!debug ? striplogs : gutil.noop);

// Install the GIT hooks
gulp.task("hooks", function() {
	var hooks = [ "pre-commit", "post-merge" ];

	return gulp.src(prefix(".git-hooks/", hooks))
	.pipe(symlink(prefix(".git/hooks/", hooks), {
		relative: true,
		force: true
	}));
});

// npm postinstall hooks
gulp.task("postinstall", [ "hooks" ]);

// Lint JavaScript files
gulp.task("jshint", function() {
	return gulp.src(files.js)
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(gitmodified("modified"))
	.pipe(jshint())
	.pipe(jshint.reporter("jshint-stylish"))
	.pipe(jshint.reporter("fail"));
});

gulp.task("jscs", function() {
	return gulp.src(files.js)
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(gitmodified("modified"))
	.pipe(jscs());
});

gulp.task("lint", [ "jshint" ]);

// Install and copy third-party libraries
gulp.task("bower", function() {
	return bower.commands.install([], { save: true }, {})
	.on("error", onerror);
});

// Copy and minify polyfills
gulp.task("polyfills", [ "bower" ], function() {
	return gulp.src(prefix(dirs.bower + "/", [
		"flexie/dist/flexie.min.js",
		"transformie/transformie.js"
	]))
	.pipe(buildscripts())
	.pipe(concat("polyfills.min.js"))
	.pipe(gulp.dest(dirs.scripts));
});

// Build browserify bundles
gulp.task("bundle", function() {
	return bundle([ "ui/app.js" ], {
		debug: true,
		transform: [ reactify ]
	})
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(buildscripts())
	.pipe(rename({ suffix: ".bundle.min" }))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest(dirs.scripts));
});

// Generate embed widget script
gulp.task("embed-legacy", function() {
	return bundle("embed/embed-parent.js", { debug: true })
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(buildscripts())
	.pipe(rename("client.min.js"))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("public"));
});

gulp.task("embed-apis", function() {
	return bundle("widget/index.js", { debug: debug })
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(buildscripts())
	.pipe(rename("sb.js"))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("public/s"))
	.on("error", gutil.log);
});

gulp.task("embed", [ "embed-legacy", "embed-apis" ]);

// Generate scripts
gulp.task("scripts", [ "polyfills", "bundle", "embed" ]);

// Generate styles
gulp.task("fonts", [ "bower" ], function() {
	return gulp.src(dirs.bower + "/lace/src/fonts/**/*")
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(gulp.dest(dirs.fonts));
});

gulp.task("scss", [ "bower" ], function() {
	return gulp.src(files.scss)
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(sourcemaps.init())
	.pipe(sass())
	.pipe(combinemq())
	.pipe(autoprefixer())
	.pipe(!debug ? minify() : gutil.noop())
	.pipe(rename({ suffix: ".min" }))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest(dirs.css));
});

gulp.task("styles", [ "fonts", "scss" ]);

// Generate appcache manifest file
gulp.task("manifest", function() {
	return gulp.src([ "public/s/dist/**/*", "!**/*.map" ])
	.pipe(plumber())
	.pipe(manifest({
		basePath: "public",
		network: [ "*" ],
		fallback: [
			"/socket /s/socket-fallback",
			"/ /fallback.html"
		],
		timestamp: true,
		filename: "manifest.appcache"
	}))
	.pipe(gulp.dest("public"));
});

// Clean up generated files
gulp.task("clean", function() {
	return del(prefix("public/", [
		"s/dist",
		"**/*.min.js", "**/*.min.css",
		"**/*.map", "**/*.appcache"
	]));
});

// Watch for changes
gulp.task("watch", function() {
	gulp.watch(files.js.concat(files.jsx), [ "scripts", "manifest" ]);
	gulp.watch(files.scss, [ "styles", "manifest" ]);
});

// Build all files
gulp.task("build", [ "scripts", "styles" ], function() {
	gulp.start("manifest");
});

// Default Task
gulp.task("default", [ "clean", "lint" ], function() {
	gulp.start("build");
});
