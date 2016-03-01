/* jslint browser: true */

define([
	'backbone'
], function(Backbone) {
	"use strict";

	var model = Backbone.Model.extend({
		defaults : function() {
			return {
				step : 'unknown'
			};
		},

		PROJ_LOC_STEP : 'specifyProjectLocation',
		CHOOSE_DATA_STEP : 'chooseData',
		PROCESS_DATA_STEP :'processData'
	});

	return model;
});


