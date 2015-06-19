"use strict";

// Load plugins and declare variables
var gulp = require("gulp"),
	del = require("del"),
	bower = require("bower"),
	browserify = require("browserify"),
	watchify = require("watchify"),
	optional = require("browserify-optional"),
	babelify = require("babelify").configure({ extensions: [ ".es6", ".jsx" ] }),
	source = require("vinyl-source-stream"),
	buffer = require("vinyl-buffer"),
	lazypipe = require("lazypipe"),
	plumber = require("gulp-plumber"),
	notify = require("gulp-notify"),
	gutil = require("gulp-util"),
	sourcemaps = require("gulp-sourcemaps"),
	jscs = require("gulp-jscs"),
	eslint = require("gulp-eslint"),
	gitmodified = require("gulp-gitmodified"),
	symlink = require("gulp-sym"),
	concat = require("gulp-concat"),
	striplogs = require("gulp-strip-debug"),
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
			"**/*.js", "**/*.es6", "**/*.jsx", "!**/*.min.js",
			"!node_modules/**", "!bower_components/**",
			"!public/s/**/*.js"
		],
		scss: [ "public/s/styles/scss/**/*.scss" ]
	};

// Make browserify bundle
function bundle(file, opts, cb) {
	var base, bundler, watcher;

	opts = opts || {};

	opts.entries = "./" + file;
	opts.debug = typeof opts.debug === "boolean" ? opts.debug : true;

	if (bundle.watch) {
		opts.cache = {};
		opts.packageCache = {};
		opts.fullPaths = true;
	}

	bundler = browserify(opts);

	base = file.split(/[\\/]/).pop();

	if (bundle.watch) {
		watcher  = watchify(bundler);

		cb(
		   watcher
			.on("update", function() {
				var start = Date.now();

				gutil.log("Starting '" + gutil.colors.yellow(file) + "'...");

				cb(
				   watcher.bundle()
					.on("error", onerror)
					.pipe(source(base))
					.pipe(buffer())
				);

				gutil.log("Finished '" + gutil.colors.yellow(file) + "' after " + gutil.colors.magenta((Date.now() - start) + " ms"));
			})
			.bundle()
			.pipe(source(base))
			.pipe(buffer())
		);
	} else {
		cb(
		   bundler.bundle()
			.on("error", function(error) {
				onerror(error);

				// End the stream to prevent gulp from crashing
				this.end();
			})
			.pipe(source(base))
			.pipe(buffer())
		);
	}
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
gulp.task("eslint", function() {
	return gulp.src(files.js)
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(gitmodified("modified"))
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failOnError());
});

gulp.task("jscs", function() {
	return gulp.src(files.js)
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(gitmodified("modified"))
	.pipe(jscs());
});

gulp.task("lint", [ "eslint" ]);

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
	return bundle("ui/app.es6", {
		transform: [ babelify, optional ]
	}, function(bundled) {
		bundled
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(buildscripts())
		.pipe(rename({
			suffix: ".bundle.min",
			extname: ".js"
		}))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(dirs.scripts));
	});
});

// Generate embed widget script
gulp.task("embed-legacy", function() {
	return bundle("embed/embed-parent.js", {
		transform: [ babelify, optional ]
	}, function(bundled) {
		bundled
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(buildscripts())
		.pipe(rename("client.min.js"))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("public"));
	});
});

gulp.task("embed-apis", function() {
	return bundle("widget/index.js", {
		transform: [ babelify, optional ]
	}, function(bundled) {
		bundled
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(buildscripts())
		.pipe(rename("sb.js"))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("public/s"));
	});
});

gulp.task("embed", [ "embed-legacy", "embed-apis" ]);

// Generate scripts
gulp.task("scripts", [ "bundle", "embed" ]);

gulp.task("scripts:watch", function() {
	bundle.watch = true;

	gulp.start("scripts");
	gulp.watch(files.js, [ "manifest" ]);
});

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

gulp.task("styles:watch", function() {
	gulp.watch(files.scss, [ "styles", "manifest" ]);
});

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
gulp.task("watch", [ "scripts:watch", "styles:watch" ]);

// Build all files
gulp.task("build", [ "polyfills", "scripts", "styles" ], function() {
	gulp.start("manifest");
});

// Default Task
gulp.task("default", [ "clean", "lint" ], function() {
	gulp.start("build");
});
