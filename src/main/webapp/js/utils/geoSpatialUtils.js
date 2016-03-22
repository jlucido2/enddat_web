/* jslint browser: true */

define([
	'underscore'
], function(_) {
	"use strict";

	var EARTH_RADIUS = 3959; // Miles

	var utils = (function() {
		var self = {};

		/*
		 * @param {Number} radians
		 * @returns {Number} - in degrees
		 */
		self.toDeg = function(radians) {
			return radians * 180 / Math.PI;
		};

		/*
		 * @param {Number} degree
		 * @returns {Number} - in radians
		 */
		self.toRad = function(degree) {
			return degree * Math.PI / 180;
		};

		/*
		 * @param {String or Number} latitude - in degrees
		 * @param {String or Number} longitude - in degrees
		 * @param {String or Number} radius - in miles
		 * @returns {Object} - with properties west, south, east, and north. They are all Numbers
		 */
		self.getBoundingBox = function(latitude, longitude, radius) {
			var lat = (_.isString(latitude)) ? parseFloat(latitude) : latitude;
			var lng = (_.isString(longitude)) ? parseFloat(longitude) : longitude;
			var r = (_.isString(radius)) ? parseFloat(radius) : radius;

			var latRad = self.toRad(lat);
			var diffRadLng = r/(EARTH_RADIUS * Math.cos(latRad)); //Calculating lat/long differences via equirectangular approximation (could do something fancier, but this seems good enough)
			var diffDegLng = self.toDeg(diffRadLng);

			var diffRadiansLat = radius/EARTH_RADIUS;
			var diffDegLat = self.toDeg(diffRadiansLat);

			return {
				west : lng - diffDegLng,
				south : lat - diffDegLat,
				east : lng + diffDegLng,
				north : lat + diffDegLat
			};

		};
		return self;
	})();

	return utils;
});


