/* jslint browser: true */

define([
	'backbone',
	'models/TimeSeriesOptionModel'
], function(Backbone, TimeSeriesOptionModel) {
	"use strict";

	var collection = Backbone.Collection.extend({
		model : TimeSeriesOptionModel
	});

	return collection;
});


