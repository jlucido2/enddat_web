// Karma configuration
// Generated on Tue Feb 09 2016 11:24:56 GMT-0700 (Mountain Standard Time)

module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../../..',
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine', 'requirejs', 'sinon'],
		// list of files / patterns to load in the browser
		files: [
			'src/test/js/test-main.js',
			{pattern: 'src/main/webapp/bower_components/Squire.js/src/Squire.js', included: false},
			{pattern: 'src/main/webapp/bower_components/jquery/dist/jquery.js', included: false},
			{pattern: 'src/main/webapp/bower_components/underscore/underscore.js', included: false},
			{pattern: 'src/main/webapp/bower_components/backbone/backbone.js', included: false},
			{pattern: 'src/main/webapp/bower_components/bootstrap/dist/js/bootstrap.js', included: false},
			{pattern: 'src/main/webapp/bower_components/handlebars/handlebars.amd.js', included: false},
			{pattern: 'src/main/webapp/bower_components/text/text.js', included: false},
			{pattern: 'src/main/webapp/bower_components/requirejs-hbs/hbs.js', included: false},
			{pattern: 'src/main/webapp/bower_components/leaflet/dist/leaflet.js', included: false},
			{pattern: 'src/main/webapp/bower_components/leaflet-providers/leaflet-providers.js', included: false},
			{pattern: 'src/main/webapp/bower_components/loglevel/dist/loglevel.js', included: false},
			{pattern: 'src/main/webapp/bower_components/backbone.stickit/backbone.stickit.js', included : false},
			{pattern: 'src/main/webapp/js/*/*.js', included: false},
			{pattern: 'src/main/webapp/js/hb_templates/*.hbs', included: false},
			{pattern: 'src/test/js/views/*.js', included: false}
		],
		// list of files to exclude
		exclude: [
			'src/main/webapp/js/init.js'
		],
		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			// source files, that you wanna generate coverage for
			// do not include tests or libraries
			// (these files will be instrumented by Istanbul)
			'src/main/webapp/js/**/*.js': ['coverage']
		},
		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['dots', 'coverage'],
		coverageReporter: {
			reporters: [
				{type: 'html', dir: 'coverage/'},
				{type: 'cobertura', dir: 'coverage/'}
			]
		},
		// web server port
		port: 9876,
		// enable / disable colors in the output (reporters and logs)
		colors: true,
		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,
		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Firefox'],
		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,
		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	});
};
