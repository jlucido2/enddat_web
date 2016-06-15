/* jslint browser: true */


define([
	'underscore',
    'backbone'
], function(_, Backbone) {
	"user strict";
	var shapefile = Backbone.model.extend({
		defaults: {
			shapefileName: '',
			encodedData: '',
			srs: 'EPSG:4326',
			projectionPolicy: 'REPROJECT_TO_DECLARED'
		}
	});
});