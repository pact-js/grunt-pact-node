'use strict';

var pact = require('@pact-foundation/pact-node'),
	_ = require('underscore'),
	path = require('path');

var targets = {};

module.exports = function (grunt) {

	grunt.registerMultiTask('pact', 'A grunt task to run pact', function (arg) {
		arg = arg || 'start';
		var done = this.async();
		var options = this.options();
		var files = this.files;

		if (!targets[this.target]) {
			targets[this.target] = pact.create(options);
		}

		switch (arg) {
			case 'start':
				targets[this.target].start().then(function (server) {
					grunt.log.writeln('Pact started on port ' + server.options.port);

					// Go through each files and call it with the server instance
					_.each(files, function(f){
						_.each(f.src, function(file){
							var func = require(path.resolve(file));
							if(_.isFunction(func)) {
								func(server);
							}
						})
					});

					done();
				});
				break;
			case 'stop':
				targets[this.target].stop().then(function (server) {
					grunt.log.writeln('Pact stopped on port ' + server.options.port);
					done();
				});
				break;
		}
	});

	process.on('exit', function () {
		for (var target in targets) {
			grunt.task.run('pact:' + target + ':stop');
		}
	});
};
