var allTestFiles = [];

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
	if (/Spec\.js$/.test(file)) {
    	allTestFiles.push(file);
  	}
});

require.config({
	// Karma serves files under /base, which is the basePath from your config file
	baseUrl: '/base/src/main/webapp/js/',

	config: {
	},


	paths: {
		'squire': '/base/src/main/webapp/bower_components/Squire.js/src/Squire',
		'bootstrap': '/base/src/main/webapp/bower_components/bootstrap/dist/js/bootstrap',
		'jquery': '/base/src/main/webapp/bower_components/jquery/dist/jquery',
		'underscore': '/base/src/main/webapp/bower_components/underscore/underscore',
		'backbone': '/base/src/main/webapp/bower_components/backbone/backbone',
		'handlebars': '/base/src/main/webapp/bower_components/handlebars/handlebars.amd',
		'text': '/base/src/main/webapp/bower_components/text/text',
		'hbs' : '/base/src/main/webapp/bower_components/requirejs-hbs/hbs',
		'leaflet' : '/base/src/main/webapp/bower_components/leaflet/dist/leaflet',
		'leaflet-providers' : '/base/src/main/webapp/bower_components/leaflet-providers/leaflet-providers',
		'loglevel' : '/base/src/main/webapp/bower_components/loglevel/dist/loglevel'
	},
	shim: {
		'jquery': {
			exports: '$'
		},
		'bootstrap': ['jquery', 'jquery-ui'],
		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
		'handlebars': {
			exports: 'Handlebars'
		},
		'text': {
			'exports': 'text'
		}
	}
});
require(allTestFiles, window.__karma__.start);
