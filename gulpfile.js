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
	notify = require("gulp-notify"),
	gutil = require("gulp-util"),
	sourcemaps = require("gulp-sourcemaps"),
	jshint = require("gulp-jshint"),
	jscs = require("gulp-jscs"),
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
		lib: "public/s/scripts/lib",
		lace: "public/s/styles/lace",
		fonts: "public/s/styles/fonts",
		scss: "public/s/styles/scss",
		css: "public/s/styles/dist"
	},
	files = {
		js: [
			"**/*.js", "!**/*.min.js",
			"!node_modules/**", "!bower_components/**",
			"!public/s/**/*.js"
		],
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

// Generate appcache manifest
function genmanifest(files, platform) {
	var filename = platform ? (platform + ".appcache") : "manifest.appcache";

	return gulp.src(files)
	.pipe(plumber())
	.pipe(manifest({
		basePath: "public",
		cache: [
			"//fonts.googleapis.com/css?family=Open+Sans:400,600",
			"//fonts.gstatic.com/s/opensans/v10/cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw.woff",
			"//fonts.gstatic.com/s/opensans/v10/MTP_ySUJH_bn48VBG8sNSnhCUOGz7vYGh680lGh-uXM.woff"
		],
		network: [ "*" ],
		fallback: [
			"/socket /s/socket-fallback",
			"/ /client.html" + (platform ? ("?platform=" + platform) : "")
		],
		preferOnline: true,
		timestamp: true,
		filename: filename
	}))
	.pipe(gulp.dest("public"));
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

// npm post-install hooks
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

gulp.task("copylibs", [ "bower" ], function() {
	return gulp.src(prefix(dirs.bower + "/", [
		"jquery/dist/jquery.min.js",
		"lace/src/js/**/*.js",
		"sockjs/sockjs.min.js",
		"svg4everybody/svg4everybody.min.js",
		"velocity/velocity.min.js"
	], "lib/post-message-polyfill.js"))
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(gulp.dest(dirs.lib));
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
	.pipe(gulp.dest(dirs.lib));
});

// Build browserify bundles
gulp.task("bundle", [ "copylibs" ], function() {
	return bundle([ "client.js" ], { debug: true })
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(buildscripts())
	.pipe(rename({ suffix: ".bundle.min" }))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("public/s/scripts"));
});

// Generate embed widget script
gulp.task("embed", function() {
	return bundle("embed/embed-parent.js", { debug: true })
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(buildscripts())
	.pipe(rename("embed.min.js"))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("public"))
	.pipe(rename("client.min.js"))
	.pipe(gulp.dest("public"));
});

// Generate scripts
gulp.task("scripts", [ "polyfills", "bundle", "embed" ]);

// Generate styles
gulp.task("lace", [ "bower" ], function() {
	return gulp.src(dirs.bower + "/lace/src/scss/**/*.scss")
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(gulp.dest(dirs.lace));
});

gulp.task("fonts", [ "bower" ], function() {
	return gulp.src(dirs.bower + "/lace/src/fonts/**/*")
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(gulp.dest(dirs.fonts));
});

gulp.task("styles", [ "lace", "fonts" ], function() {
	return gulp.src(files.scss)
	.pipe(plumber({ errorHandler: onerror }))
	.pipe(sourcemaps.init())
	.pipe(sass({
		outputStyle: "expanded",
		lineNumbers: !gutil.env.production,
		sourceMap: true
	}))
	.pipe(combinemq())
	.pipe(!debug ? autoprefixer() : gutil.noop())
	.pipe(!debug ? minify() : gutil.noop())
	.pipe(rename({ suffix: ".min" }))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest(dirs.css));
});

// Generate appcache manifest file
gulp.task("client-manifest", function() {
	return genmanifest(prefix("public/s/", [
		"scripts/lib/jquery.min.js",
		"scripts/client.bundle.min.js",
		"styles/dist/client.min.css",
		"styles/fonts/icons.*",
		"img/client/**/*"
	]));
});

gulp.task("cordova-android-manifest", function() {
	return genmanifest(prefix("public/s/", [
		"phonegap/**/*",
		"scripts/lib/jquery.min.js",
		"scripts/client.bundle.min.js",
		"styles/dist/client.min.css",
		"styles/fonts/icons.*",
		"img/client/**/*"
	]), "cordova-android");
});

gulp.task("manifest", [ "client-manifest", "cordova-android-manifest" ]);

// Clean up generated files
gulp.task("clean", function() {
	return del(prefix("public/", [
		"**/*.min.js", "**/*.min.css",
		"**/*.map", "**/*.appcache}"
	], dirs.lib, dirs.css, dirs.lace, dirs.fonts));
});

// Watch for changes
gulp.task("watch", function() {
	gulp.watch(files.js, [ "scripts", "manifest" ]);
	gulp.watch(files.scss, [ "styles", "manifest" ]);
});

// Build all files
gulp.task("build", [ "scripts", "styles", "manifest" ]);

// Default Task
gulp.task("default", [ "clean", "lint" ], function() {
	gulp.start("build");
});
