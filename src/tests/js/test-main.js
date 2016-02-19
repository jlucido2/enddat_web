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
		'views/BaseView': {
			lookupUrl: "test_lookup/"
		}
	},	


	paths: {
		'sinon': '/base/src/main/webapp/js/bower_components/sinon/lib/sinon',
		'squire': '/base/src/main/webapp/js/bower_components/Squire.js/src/Squire',
		'jquery': '/base/src/main/webapp/js/bower_components/jquery/dist/jquery',
		'bootstrap': '/base/src/main/webapp/js/bower_components/bootstrap/dist/js/bootstrap',
		'underscore': '/base/src/main/webapp/js/bower_components/underscore/underscore',
		'backbone': '/base/src/main/webapp/js/bower_components/backbone/backbone',
		'handlebars': '/base/src/main/webapp/js/bower_components/handlebars/handlebars.amd',
		'text': '/base/src/main/webapp/js/bower_components/text/text'
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
		'sinon': {
			'exports': 'sinon'
		},
		'text': {
			'exports': 'text'
		}
	}
});
require(allTestFiles, window.__karma__.start);
