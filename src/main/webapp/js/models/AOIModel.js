/* jslint browser: true */

define([
	'underscore',
	'backbone',
	'utils/geoSpatialUtils'
], function(_, Backbone, geoSpatialUtils) {
	"use strict";

	var model = Backbone.Model.extend({

		/*
		 * @return Boolean - true if the AOI should be defined using a location and radius
		 */
		usingProjectLocation : function() {
			return this.has('latitude') && this.has('longitude') && this.has('radius');
		},

		/*
		 * @return Boolean - true if the AOI should be defined by a bounding box
		 */
		usingAOIBox : function() {
			return this.has('aoiBox');
		},

		/*
		 * @return Boolean - true if the area of interest is fully defined
		 */
		hasValidAOI : function() {
			var result = false;
			if (this.usingProjectLocation()) {
				result =  ((this.attributes.latitude) && (this.attributes.longitude) && (this.attributes.radius)) ? true : false;
			}
			else if (this.usingAOIBox()) {
				result = !_.isEmpty(this.attributes.aoiBox);
			}
			return result;
		},

		/*
		 * @return {Object with south, west, north, east parameters} - Returns the bounding box represented by the model.
		 *		Returns undefined if the model does not contain a fully defined area of interset.
		 */
		getBoundingBox : function() {
			var result = undefined;
			if (this.usingProjectLocation()) {
				if ((this.attributes.latitude) && (this.attributes.longitude) && (this.attributes.radius)) {
					result = geoSpatialUtils.getBoundingBox(
						this.attributes.latitude,
						this.attributes.longitude,
						this.attributes.radius
					);
				}
			}
			else if (this.usingAOIBox()) {
				if (!_.isEmpty(this.attributes.aoiBox)) {
					result = this.attributes.aoiBox;
				}
			}
			return result;
		}
	});

	return model;
});

