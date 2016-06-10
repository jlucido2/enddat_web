/* jslint browser: true */


define([
	'underscore',
    'backbone'
], function(_, Backbone) {
	"user strict";
	var shapefile = Backbone.Collection.extend({
		defaults: {
			shapefileName: '',
			srs: 'EPSG:4326',
			projectionPolicy: 'REPROJECT_TO_DECLARED'
		}
	});
});