/* jslint browser: true */

define([
	'underscore'
], function(_) {
	"use strict";

	var utils = (function() {
		var self = {};

		self.createIcon = function createIcon(iconUrl) {
			return new L.icon({
				iconUrl : iconUrl,
				iconSize : [10, 10]
			});
		};
		return self;
	})();

	return utils;
});


