"use strict";

// Load plugins and declare constants
import gulp from "gulp";
import del from "del";
import bower from "bower";
import browserify from "browserify";
import watchify from "watchify";
import optional from "browserify-optional";
import babelify from "babelify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import lazypipe from "lazypipe";
import plumber from "gulp-plumber";
import notify from "gulp-notify";
import gutil from "gulp-util";
import sourcemaps from "gulp-sourcemaps";
import eslint from "gulp-eslint";
import gitmodified from "gulp-gitmodified";
import symlink from "gulp-sym";
import concat from "gulp-concat";
import striplogs from "gulp-strip-debug";
import uglify from "gulp-uglify";
import rename from "gulp-rename";
import sass from "gulp-sass";
import combinemq from "gulp-combine-mq";
import autoprefixer from "gulp-autoprefixer";
import minify from "gulp-minify-css";
import manifest from "gulp-manifest";
import config from "./server-config-defaults.js";

const debug = !(gutil.env.production || config.env === "production"),
	errorHandler = notify.onError("Error: <%= error.message %>"),
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

babelify.configure({ extensions: [ ".es6", ".jsx" ] });

// Make browserify bundle
function bundle(file, options, cb) {
	let base, bundler, watcher, opts;

	opts = options || {};

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
		watcher = watchify(bundler);

		cb(
			watcher
			.on("update", () => {
				gutil.log("Starting '" + gutil.colors.yellow(file) + "'...");

				cb(
					watcher.bundle()
					.on("error", errorHandler)
					.pipe(source(base))
					.pipe(buffer())
				);
			})
			.on("time", time => gutil.log("Finished '" + gutil.colors.yellow(file) + "' after " + gutil.colors.magenta(time + " ms")))
			.bundle()
			.pipe(source(base))
			.pipe(buffer())
		);
	} else {
		cb(
			bundler.bundle()
			.on("error", error => {
				errorHandler(error);

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
	let prefixed = [];

	if (!(arr && arr instanceof Array)) {
		return arr;
	}

	for (const item of arr) {
		prefixed.push(str + item);
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
const buildscripts = lazypipe()
	.pipe(plumber, { errorHandler })
	.pipe(!debug ? uglify : gutil.noop)
	.pipe(!debug ? striplogs : gutil.noop);

// Install the GIT hooks
gulp.task("hooks", () => {
	const hooks = [ "pre-commit", "post-merge" ];

	return gulp.src(prefix(".git-hooks/", hooks))
	.pipe(symlink(prefix(".git/hooks/", hooks), {
		relative: true,
		force: true
	}));
});

// npm postinstall hooks
gulp.task("postinstall", [ "hooks" ]);

// Lint JavaScript files
gulp.task("eslint", () =>
	gulp.src(files.js)
	.pipe(plumber({ errorHandler }))
	.pipe(gitmodified("modified"))
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failOnError())
);

gulp.task("lint", [ "eslint" ]);

// Install and copy third-party libraries
gulp.task("bower", () =>
	bower.commands.install([], { save: true }, {})
	.on("error", errorHandler)
);

// Copy and minify polyfills
gulp.task("polyfills", [ "bower" ], () =>
	gulp.src(prefix(dirs.bower + "/", [
		"flexie/dist/flexie.min.js",
		"transformie/transformie.js"
	]))
	.pipe(buildscripts())
	.pipe(concat("polyfills.min.js"))
	.pipe(gulp.dest(dirs.scripts))
);

// Build browserify bundles
gulp.task("bundle", () =>
	bundle("ui/app.es6", {
		transform: [ babelify, optional ]
	}, bundled => bundled
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(buildscripts())
		.pipe(rename({
			suffix: ".bundle.min",
			extname: ".js"
		}))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(dirs.scripts)))
);

// Generate embed widget script
gulp.task("embed-legacy", () =>
	bundle("embed/embed-parent.js", {
		transform: [ babelify, optional ]
	}, bundled => bundled
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(buildscripts())
		.pipe(rename("client.min.js"))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("public")))
);

gulp.task("embed-apis", () =>
	bundle("widget/index.js", {
		transform: [ babelify, optional ]
	}, bundled => bundled
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(buildscripts())
		.pipe(rename("sb.js"))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("public/s")))
);

gulp.task("embed", [ "embed-legacy", "embed-apis" ]);

// Generate scripts
gulp.task("scripts", [ "bundle", "embed" ]);

gulp.task("scripts:watch", () => {
	bundle.watch = true;

	gulp.start("scripts");
	gulp.watch(files.js, [ "manifest" ]);
});

// Generate styles
gulp.task("fonts", [ "bower" ], () =>
	gulp.src(dirs.bower + "/lace/src/fonts/**/*")
	.pipe(plumber({ errorHandler }))
	.pipe(gulp.dest(dirs.fonts))
);

gulp.task("scss", [ "bower" ], () =>
	gulp.src(files.scss)
	.pipe(plumber({ errorHandler }))
	.pipe(sourcemaps.init())
	.pipe(sass())
	.pipe(combinemq())
	.pipe(autoprefixer())
	.pipe(!debug ? minify() : gutil.noop())
	.pipe(rename({ suffix: ".min" }))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest(dirs.css))
);

gulp.task("styles", [ "fonts", "scss" ]);

gulp.task("styles:watch", () => gulp.watch(files.scss, [ "styles", "manifest" ]));

// Generate appcache manifest file
gulp.task("manifest", () =>
	gulp.src([
		"public/s/assets/logo/*",
		"public/s/dist/**/*",
		"!**/{*.map,config.json,LICENSE.txt}"
	])
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
	.pipe(gulp.dest("public"))
);

// Clean up generated files
gulp.task("clean", () => del(prefix("public/", [
	"s/dist",
	"**/*.min.js", "**/*.min.css",
	"**/*.map", "**/*.appcache"
])));

// Watch for changes
gulp.task("watch", [ "scripts:watch", "styles:watch" ]);

// Build all files
gulp.task("build", [ "polyfills", "scripts", "styles" ], () =>  gulp.start("manifest"));

// Default Task
gulp.task("default", [ "clean", "lint" ], () => gulp.start("build"));
