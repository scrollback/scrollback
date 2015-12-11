"use strict";

require("babel-polyfill");

// Load plugins and declare constants
import gulp from "gulp";
import gutil from "gulp-util";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import sass from "gulp-sass";
import combinemq from "gulp-combine-mq";
import autoprefixer from "gulp-autoprefixer";
import minify from "gulp-minify-css";
import del from "del";
import webpack from "webpack";
import config from "./server-config-defaults.js";

const __DEV__ = global.__DEV__ = !(gutil.env.production || config.env === "production");

const bundleCompiler = webpack(require("./webpack.config"));
const widget1Compiler = webpack(require("./webpack-widget-v1.config"));
const widget2Compiler = webpack(require("./webpack-widget-v2.config"));

const bundler = (cb, compiler) => compiler.run((err, stats) => {
	if (err) {
		throw new gutil.PluginError("webpack", err);
	}

	gutil.log("[webpack]", stats.toString());

	cb();
});

const watcher = compiler => compiler.watch({}, (err, stats) => {
	if (err) {
		throw new gutil.PluginError("webpack", err);
	}

	gutil.log("[webpack]", stats.toString());
});

// Build bundles
gulp.task("bundle", cb => bundler(cb, bundleCompiler));
gulp.task("bundle:watch", () => watcher(bundleCompiler));

// Generate embed widget scripts
gulp.task("widget:v1", cb => bundler(cb, widget1Compiler));
gulp.task("widget:v2", cb => bundler(cb, widget2Compiler));
gulp.task("widget:v1:watch", () => watcher(widget1Compiler));
gulp.task("widget:v2:watch", () => watcher(widget2Compiler));

gulp.task("widget", [ "widget:v1", "widget:v2" ]);
gulp.task("widget:watch", [ "widget:v1:watch", "widget:v2:watch" ]);

// Generate scripts
gulp.task("scripts", [ "bundle", "widget" ]);
gulp.task("scripts:watch", [ "bundle:watch", "widget:watch" ]);

// Generate styles
gulp.task("styles", () =>
	gulp.src("public/s/styles/scss/**/*.scss")
	.pipe(sourcemaps.init())
	.pipe(sass())
	.pipe(combinemq())
	.pipe(autoprefixer())
	.pipe(__DEV__ ? gutil.noop() : minify())
	.pipe(rename({ suffix: ".min" }))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("public/s/dist/styles"))
);

gulp.task("styles:watch", () => gulp.watch("public/s/styles/scss/**/*.scss", [ "styles" ]));

// Copy font files
gulp.task("fonts", () =>
	gulp.src("./node_modules/lace/src/fonts/**/*")
	.pipe(gulp.dest("public/s/dist/fonts"))
);

// Clean up generated files
gulp.task("clean", () => del([
	"public/s/dist/",
	"public/**/*.{min.js,min.css,map,appcache}"
]));

// Watch for changes
gulp.task("watch", [ "styles:watch", "scripts:watch" ]);

// Build scripts and styles
gulp.task("build", [ "scripts", "styles", "fonts" ]);

// Default Task
gulp.task("default", [ "clean" ], () => gulp.start("build"));
