/* jslint browser: true */

define([
	'backbone',
	'utils/geoSpatialUtils'
], function(Backbone, geoSpatialUtils) {
	"use strict";

	var model = Backbone.Model.extend({

		usingProjectLocation : function() {
			return this.has('latitude') && this.has('longitude') && this.has('radius');
		},

		usingAOIBox : function() {
			return this.has('aoiBox')
		},

		hasValidAOI : function() {
			var result = false;
			if (this.usingProjectLocation()) {
				result =  ((this.attributes.latitude) && (this.attributes.longitude) && (this.attributes.radius)) ? true : false;
			}
			else if (this.usingAOIBox()) {
				result = (this.attributes.aoiBox) ? true : false;
			}
			return result;
		},

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
				result = this.attributes.aoiBox;
			}
			return result;
		}
	});

	return model;
});

