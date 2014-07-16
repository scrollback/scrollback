/*
	Scrollback: Beautiful text chat for your community.
	Copyright (c) 2014 Askabt Pte. Ltd.

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or any
later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see http://www.gnu.org/licenses/agpl.txt
or write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330,
Boston, MA 02111-1307 USA.
*/

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		bowercopy: {
			options: {
				srcPrefix: "bower_components"
			},
			scripts: {
				options: {
					destPrefix: "public/s/lib"
				},
				files: {
					"flexie.min.js": "flexie/dist/flexie.min.js",
					"html5shiv.min.js": "html5shiv/dist/html5shiv.min.js",
					"jquery.min.js": "jquery/dist/jquery.min.js",
					"selectivizr.js": "selectivizr/selectivizr.js",
					"sockjs.min.js": "sockjs/sockjs.min.js",
					"svg4everybody.min.js": "svg4everybody/svg4everybody.min.js",
					"transformie.js": "transformie/transformie.js",
					"jquery.velocity.min.js": "velocity/jquery.velocity.min.js"
				}
			}
		},
		browserify: {
			dist: {
				files: {
					"public/libsb.bundle.js": ["libsb.js"],
					"public/client.bundle.js": ["client.js"],
					"public/embed.js": ["embed/embed-widget.js"]
				},
				options: {
					bundleOptions: { debug: true }
				}
			}
		},
		uglify: {
			options: {
				report: "min"
			},
			core: {
				src: ["public/libsb.bundle.js"],
				dest: "public/libsb.bundle.min.js"
			},
			client: {
				src: ["public/client.bundle.js"],
				dest: "public/client.bundle.min.js"
			},
			embed: {
				src: ["public/embed.js"],
				dest: "public/embed.min.js"
			}
		},
		concat: {
			options: {
				separator: ";\n\n"
			},
			client: {
				src: ["public/sdk/sockjs.js", "public/core.uw.min.js", "public/embed.uw.min.js"],
				dest: "public/client.min.js",
			},
			core: {
				src: ["public/sdk/sockjs.js", "public/core.uw.min.js"],
				dest: "public/core.min.js",
			}
		},
		wrap: {
			options: {
				wrapper: ["(function() {", "}())"]
			},
			core: {
				src: ["public/libsb.bundle.min.js"],
				dest: "public/libsb.bundle.min.js"
			},
			client: {
				src: ["public/client.bundle.min.js"],
				dest: "public/client.bundle.min.js"
			},
			embed: {
				src: ["public/embed.min.js"],
				dest: "public/client.min.js"
			}
		},
		sass: {
			dist: {
				options: {
					style: "compressed",
					sourcemap: true
				},
				files: [{
					expand: true,
					cwd: "public/s/styles/scss",
					src: ["*.scss"],
					dest: "public/s/styles/gen",
					ext: ".css"
				}]
			}
		},
		autoprefixer: {
			dist: {
				src: "public/s/styles/*/*.css"
			}
		},
		manifest: {
			generate: {
				options: {
					basePath: "public",
					cache: ["//fonts.googleapis.com/css?family=Open+Sans:300,400,600",
							"//themes.googleusercontent.com/font?kit=cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw"],
					network: ["*"],
					fallback: ["//gravatar.com/avatar/ /s/img/client/avatar-fallback.svg", "/ /offline.html"],
					preferOnline: true,
					timestamp: true
				},
				src: [
					"client.bundle.js",
					"sdk/sockjs.js",
					"s/lib/jquery.min.js",
					"s/styles/gen/*.css",
					"s/img/client/*.*",
					"s/img/client/*/*.*",
				],
				dest: "public/manifest.appcache"
			}
		},
		watch: {
			options: {
				livereload: true,
			},
			scripts: {
				files: ["gruntfile.js", "*/*-client.js",
						"public/client.js", "public/libsb.js",
						"lib/*.js", "ui/*.js"],
				tasks: ["browserify", "uglify", "manifest"],
			},
			styles: {
				files: ["gruntfile.js", "public/s/styles/scss/*.scss"],
				tasks: ["sass", "autoprefixer", "manifest"],
			},
			misc: {
				files: ["public/client.html", "public/s/img/client/*.*", "public/s/img/client/*/*.*"],
				tasks: ["manifest"],
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-bowercopy");
	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-wrap");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-autoprefixer");
	grunt.loadNpmTasks("grunt-manifest");

	// Default task(s).
	grunt.event.on("watch", function(action, filepath, target) {
		grunt.log.writeln(target + ": " + filepath + " has " + action);
	});

	grunt.registerTask("default", ["bowercopy", "browserify", "uglify", "concat", "wrap", "sass", "autoprefixer", "manifest"]);
};
