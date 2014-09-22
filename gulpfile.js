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
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	sass = require("gulp-ruby-sass"),
	prefix = require("gulp-autoprefixer"),
	minify = require("gulp-minify-css"),
    handlebars = require("gulp-compile-handlebars"),
	manifest = require("gulp-manifest"),
	rimraf = require("gulp-rimraf"),
    clientConfig = require("./client-config.js"),
	bowerDir = "bower_components",
	libDir = "public/s/scripts/lib",
	laceDir = "public/s/styles/lace",
	cssDir = "public/s/styles/dist",
	jsFiles = [
		"*/*-client.js",
		"lib/*.js", "ui/*.js",
		"public/client.js", "public/libsb.js", "client-init/*.js",
		"client-entityloader/*.js", "localStorage/*.js", "socket/*.js", "interface/*.js"
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
    return gulp.src([
        bowerDir + "/jquery/dist/jquery.min.js",
        bowerDir + "/lace/src/js/lace.js",
        bowerDir + "/sockjs/sockjs.min.js",
        bowerDir + "/svg4everybody/svg4everybody.min.js",
        bowerDir + "/velocity/jquery.velocity.min.js",
        bowerDir + "/velocity/velocity.ui.min.js"
    ])
    .pipe(plumber())
    .pipe(gulp.dest(libDir))
    .on("error", gutil.log);
});

// Copy and minify polyfills
gulp.task("polyfills", function() {
    return gulp.src([
        bowerDir + "/flexie/dist/flexie.min.js",
        bowerDir + "/transformie/transformie.js"
    ])
    .pipe(plumber())
    .pipe(concat("polyfills.js"))
    .pipe(gutil.env.production ? streamify(uglify()) : gutil.noop())
    .pipe(gulp.dest(libDir))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(libDir))
    .on("error", gutil.log);
});

// Build browserify bundles
gulp.task("bundle", [ "libs" ], function() {
    return bundle([ "libsb.js", "client.js" ], { debug: !gutil.env.production })
    .pipe(plumber())
	.pipe(gutil.env.production ? streamify(uglify()) : gutil.noop())
	.pipe(rename({ suffix: ".bundle.min" }))
	.pipe(gulp.dest("public/s/scripts"))
	.on("error", gutil.log);
});

// Generate embed widget script
gulp.task("embed", function() {
    return bundle("embed/embed-parent.js", { debug: !gutil.env.production })
    .pipe(plumber())
	.pipe(gutil.env.production ? streamify(uglify()) : gutil.noop())
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
		style: "expanded",
		sourcemapPath: "../scss"
    }))
    .pipe(plumber())
	.on("error", function(e) { gutil.log(e.message); })
	.pipe(gutil.env.production ? (prefix() && minify()) : gutil.noop())
	.pipe(gulp.dest(cssDir))
	.on("error", gutil.log);
});

// Generate client.html for phonegap
gulp.task("handlebars", function() {
    var data = clientConfig.phonegap;

    return gulp.src("public/client.hbs")
    .pipe(plumber())
    .pipe(handlebars(data))
    .pipe(rename({
        suffix: ".phonegap",
        extname: ".html"
    }))
    .pipe(gulp.dest("public/s"))
    .on("error", gutil.log);
});

// Generate appcache manifest file
gulp.task("manifest", function() {
    var protocol = clientConfig.server.protocol,
        host = clientConfig.server.host,
        baseUrl = protocol + host + "/";

    return gulp.src([
        "public/**/*",
        "!public/{**/*.html,t/**}",
        "!public/s/{*,img/*,img/covers/*,styles/scss/*}",
        "!public/s/scripts/{*/*.map,js/*,lib/*}",
        "!public/s/styles/{*/*.map,css/*,lace/*,scss/*}"
    ])
    .pipe(plumber())
    .pipe(manifest({
        baseUrl: protocol + host + "/",
        cache: [
            protocol + "//fonts.googleapis.com/css?family=Open+Sans:300,400,600",
            protocol + "//themes.googleusercontent.com/font?kit=cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw"
        ],
        network: [ "*" ],
        fallback: [
            "//gravatar.com/avatar/ " + baseUrl + "s/img/client/avatar-fallback.svg",
            "/socket " + baseUrl + "s/socket-fallback",
            "/ " + baseUrl + "s/offline.html"
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
		"public/{client.html,s/client.phonegap.html}",
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
gulp.task("default", [ "scripts", "styles", "handlebars", "manifest" ]);
