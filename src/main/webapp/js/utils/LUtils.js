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
		return self;
	})();

	return utils;
});


