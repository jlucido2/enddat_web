/* jslint browser: true */


define([
	'underscore',
    'backbone'
], function(_, Backbone) {
	"user strict";
	var shapefile = Backbone.Collection.extend({
		initialize: function() {
			alert("shapefile model initialized...");
		}
	});
});