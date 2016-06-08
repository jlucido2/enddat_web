/* jslint browser: true */

define([
	'leaflet'
], function(L) {
	"use strict";

	var utils = (function() {
		var self = {};

		var MILES_PER_METER = 0.000621371;

		self.milesBetween = function(latlng1, latlng2) {
			return latlng1.distanceTo(latlng2) * MILES_PER_METER;
		};

		self.getLatLngBounds = function(bbox) {
			var southwest = L.latLng(bbox.south, bbox.west);
			var northeast = L.latLng(bbox.north, bbox.east);
			return L.latLngBounds(southwest, northeast);
		};

		self.getBbox = function(latLngBounds) {
			return {
				west : latLngBounds.getWest(),
				south : latLngBounds.getSouth(),
				east : latLngBounds.getEast(),
				north : latLngBounds.getNorth()
			};
		};
		return self;
	})();

	return utils;
});


