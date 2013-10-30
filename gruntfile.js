module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
		options: {
			report: 'min'
		},
		core: {
			src: ['public/sdk/polyfill.js','public/sdk/addEvent.js',
				'public/sdk/emitter.js' ,'public/sdk/request.js', 'public/sdk/cache.js',
				'public/sdk/client.js' ],
			dest: 'public/core.uw.min.js'
		},
		embed: {
			src: ['public/sdk/addStyle.js','public/sdk/css.js','public/sdk/dom.js',
				'public/sdk/domReady.js','public/sdk/getByClass.js','public/sdk/jsonml2.js',
				'public/sdk/embed.js','public/sdk/render.js',
				'public/sdk/browserNotify.js','public/sdk/dialog.js'],
			dest: 'public/embed.uw.min.js'
		}
    },
	concat: {
		options: { separator: ';\n\n' },
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
		client: {
			src: ["public/client.min.js"],
			dest: "public/client.min.js"
		},
		core: {
			src: ["public/core.uw.min.js"],
			dest: "public/core.min.js"
		}
	},
	watch: {
		scripts: {
			files: ['public/sdk/sockjs.js','public/sdk/polyfill.js','public/sdk/addEvent.js',
					'public/sdk/emitter.js' ,'public/sdk/request.js','public/sdk/addStyle.js',
					'public/sdk/css.js', 'public/sdk/dom.js','public/sdk/domReady.js','public/sdk/getByClass.js',
					'public/sdk/jsonml2.js','public/sdk/cache.js','public/sdk/embed.js','public/sdk/render.js'],
			tasks: ['uglify', 'concat', 'wrap'],
		},
		styles: {
			files: ['public/style.less', 'public/dummy.less'],
			tasks: ['less']
		}
	},
	less: {//style.less--->style.css
		development: {
			files: {//dest            //source
				"public/style.css": "public/style.less",
				"public/dummy.css": "public/dummy.less"
			},
		},
	},
  });
  
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  // Default task(s).
  
  grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });
  grunt.registerTask('default', ['uglify', 'concat', 'wrap']);
  

};
