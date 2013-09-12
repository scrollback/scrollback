module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build1: {
        src: [ 'public/sdk/socket.io.js','public/sdk/polyfill.js','public/sdk/addEvent.js','public/sdk/emitter.js' ,'public/sdk/request.js' ],
        dest: 'public/core.min.js'
      },
	  build2: {
		src: ['public/sdk/socket.io.js','public/sdk/polyfill.js','public/sdk/addEvent.js','public/sdk/emitter.js' ,'public/sdk/request.js','public/sdk/addStyle.js','public/sdk/css.js', 'public/sdk/dom.js','domReady.js','getByClass.js','jsonml2.js','cache.js','embed.js','render.js'],
        dest: 'public/client.min.js'
      }
    },
	wrap: {
	  client: {
		src: ["public/client.min.js"],
		dest: "public/client.min.js",
		options: {
			wrapper: ["(function() {", "}())"]
		}
	  },
	  core: {
		src: ["public/core.min.js"],
		dest: "public/core.min.js",
		options: {
			wrapper: ["(function() {", "}())"]
		}
	  }
	},
	watch: {
		scripts: {
			files: ['public/sdk/socket.io.js','public/sdk/polyfill.js','public/sdk/addEvent.js','public/sdk/emitter.js' ,'public/sdk/request.js','public/sdk/addStyle.js','public/sdk/css.js', 'public/sdk/dom.js','domReady.js','getByClass.js','jsonml2.js','cache.js','embed.js','render.js'],
			tasks: ['uglify', 'wrap'],
		},
		styles: {
			files: ['public/style.less'],
			tasks: ['less']
		}
	},
	less: {//style.less--->style.css
		development: {
			files: {//dest            //source
				"public/style.css": "public/style.less",
			},
		},
	},
  });
  
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  // Default task(s).
  
  grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });
  grunt.registerTask('default', ['uglify', 'wrap']);
  

};