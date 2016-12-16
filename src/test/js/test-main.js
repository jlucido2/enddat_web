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
		'utils/VariableDatasetMapping' : {
			variableDatasetMappingUrl : 'base/src/test/json/variableDatasetMapping.json'
		},
		'models/PrecipitationCollection' : {
			precipWFSGetFeatureUrl : 'http:dummyservice/wfs/?service=wfs&amp;version=2.0.0',
			cidaThreddsPrecipData : 'dodsC/fakedata'
		},
		'models/NWISCollection' : {
			pmCodesUrl : 'https:dummyservice/pmcodes'
		},
		'models/GLCFSCollection' : {
			glcfsWFSGetFeatureUrls : {
				'Erie' : 'http:dummyservice/wfs/?service=wfs&amp;version=2.0.0',
				'Huron' : 'http:dummyservice/wfs/?service=wfs&amp;version=2.0.0',
				'Michigan' : 'http:dummyservice/wfs/?service=wfs&amp;version=2.0.0',
				'Ontario' : 'http:dummyservice/wfs/?service=wfs&amp;version=2.0.0',
				'Superior' : 'http:dummyservice/wfs/?service=wfs&amp;version=2.0.0'
			}
		},
		'views/ProcessDataView' : {
			baseUrl : 'http:fakeservice/enddat/'
		}
	},

	paths: {
		'squire': '/base/src/main/webapp/bower_components/Squire.js/src/Squire',
		'bootstrap': '/base/src/main/webapp/bower_components/bootstrap/dist/js/bootstrap',
		'jquery': '/base/src/main/webapp/bower_components/jquery/dist/jquery',
		"jquery.ui.widget": '/base/src/main/webapp/bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget',
		'blueimp-file-upload': '/base/src/main/webapp/bower_components/blueimp-file-upload/js/jquery.fileupload',
		'select2': '/base/src/main/webapp/bower_components/select2/dist/js/select2.full',
		'underscore': '/base/src/main/webapp/bower_components/underscore/underscore',
		'backbone': '/base/src/main/webapp/bower_components/backbone/backbone',
		'handlebars': '/base/src/main/webapp/bower_components/handlebars/handlebars.amd',
		'text': '/base/src/main/webapp/bower_components/text/text',
		'hbs' : '/base/src/main/webapp/bower_components/requirejs-hbs/hbs',
		'leaflet' : '/base/src/main/webapp/bower_components/leaflet/dist/leaflet',
		'leaflet-providers' : '/base/src/main/webapp/bower_components/leaflet-providers/leaflet-providers',
		'leaflet-draw' : '/base/src/main/webapp/bower_components/leaflet-draw/dist/leaflet.draw',
		'loglevel' : '/base/src/main/webapp/bower_components/loglevel/dist/loglevel',
		'backbone.stickit' : '/base/src/main/webapp/bower_components/backbone.stickit/backbone.stickit',
		'moment' : '/base/src/main/webapp/bower_components/moment/moment',
		'bootstrap-datetimepicker' : '/base/src/main/webapp/bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
		'csv' : '../bower_components/csv/lib/csv',
		'filesaver' : '../bower_components/filesaverjs/FileSaver'
	},
	shim: {
		'bootstrap': ['jquery'],
		'leaflet' : {
			exports: 'L'
		},
		'filesaver' : {
			exports: 'Filesaver'
		},
		'leaflet-draw' : ['leaflet'],
		'leaflet-providers' : ['leaflet'],
		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
		'backgrid': {
			deps: ['jquery', 'underscore', 'backbone'],
			exports: 'Backgrid'
		},
		'backbone.stickit' : ['backbone', 'underscore'],
		'bootstrap-datetimepicker' : ['jquery', 'bootstrap', 'moment']
	}
});
require(allTestFiles, window.__karma__.start);
