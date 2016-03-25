/* jslint browser: true */

define([
	'backbone',
	'utils/geoSpatialUtils'
], function(Backbone, geoSpatialUtils) {
	"use strict";

	var model = Backbone.Model.extend({
		defaults : function() {
			return {
				step : 'unknown'
			};
		},

		PROJ_LOC_STEP : 'specifyProjectLocation',
		CHOOSE_DATA_STEP : 'chooseData',
		PROCESS_DATA_STEP :'processData',

		/*
		 * @return {Object}
		 * Returns the bounding box as an object with west, east, north, and south properties.
		 * Return undefined if the model's properties do not contain a valid bounding box
		 */
		getBoundingBox : function() {
			var result = undefined;
			if ((this.attributes.radius) && (this.attributes.location) &&
				(this.attributes.location.latitude) && (this.attributes.location.longitude)) {
				result = geoSpatialUtils.getBoundingBox(
					this.attributes.location.latitude,
					this.attributes.location.longitude,
					this.attributes.radius
				);
			}
			return result;
		}
	});

	return model;
});


