/* jslint browser: true */

define([], function() {
	"use strict";

	var self = {};

	/* @param	{String} str
	 * @returns	{String}  - Capitalizes each character which follows a space.
	 */
	self.toTitleCase = function (str) {
		var lowerCase = str.toLowerCase();
	    return lowerCase.replace(/(?:^|\s)\w/g, function(match) {
	        return match.toUpperCase();
	    });
	};

	return self;
});

