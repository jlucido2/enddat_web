({
	baseUrl: "src/main/webapp/js/",

	paths: {
		"bootstrap" :  '../bower_components/bootstrap/dist/js/bootstrap',
		"jquery": '../bower_components/jquery/dist/jquery',
		'jquery.ui.widget' : '../bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget',
		'blueimp-file-upload': '../bower_components/blueimp-file-upload/js/jquery.fileupload',
		"backbone": '../bower_components/backbone/backbone',
		"underscore": '../bower_components/underscore/underscore',
		"select2": '../bower_components/select2/dist/js/select2.full',
		"text": '../bower_components/text/text',
		"hbs" : '../bower_components/requirejs-hbs/hbs',
		'leaflet' : '../bower_components/leaflet/dist/leaflet',
		'leaflet-providers' : '../bower_components/leaflet-providers/leaflet-providers',
		'leaflet-draw' : '../bower_components/leaflet-draw/dist/leaflet.draw',
		'loglevel' : '../bower_components/loglevel/dist/loglevel',
		'backbone.stickit' : '../bower_components/backbone.stickit/backbone.stickit',
		'moment' : '../bower_components/moment/moment',
		'bootstrap-datetimepicker' : '../bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
		'handlebars' : '../bower_components/handlebars/handlebars',
		'handlebars-compiler' : '../bower_components/handlebars/handlebars'
	},
	shim: {
		"bootstrap": [ "jquery" ],
		'leaflet' : {
			exports: 'L'
		},
		'leaflet-draw': ['leaflet'],
		'leaflet-providers': ['leaflet'],
		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
		'backgrid': {
			deps: ['jquery', 'underscore', 'backbone'],
			exports: 'Backgrid'
		},
		'backbone.stickit': ['backbone', 'underscore'],
		'bootstrap-datetimepicker': ['jquery', 'bootstrap', 'moment'],
		'handlebars': {exports: 'Handlebars'}
	},
	packages : [
		{
		name : 'hbs',
			location: "../bower_components/requirejs-hbs",
			main : 'hbs'
		}
	],

	name : 'init',

	deps : ['../bower_components/requirejs/require'],

	// Run the module js/main as soon as it is ready.
	insertRequire: ["init"],

	dir: "src/main/webapp/assets-build"
});