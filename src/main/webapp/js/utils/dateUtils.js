/* jslint browser */

define([
	'moment'
], function(moment) {
	var utils = (function() {
		var self = {};

		/*
		 * @param {String} dateToTest - date Object
		 * @param {Object with start and end string properties} dateRange - properties should be date objects
		 * @returns {Boolean} - True if dateToTest is with dateRange.start and dateRange.end inclusive
		 */
		self.inDateRange = function(dateToTest, dateRange) {
			var momentToTest = moment(dateToTest);
			return (momentToTest.isSameOrAfter(dateRange.start) && momentToTest.isSameOrBefore(dateRange.end));
		};

		self.dateRangeOverlaps = function(dateRange1, dateRange2) {
			return (self.inDateRange(dateRange1.start, dateRange2) ||
				self.inDateRange(dateRange1.end, dateRange2) ||
				(self.inDateRange(dateRange2.start, dateRange1) && self.inDateRange(dateRange2.end, dateRange1)));
		};

		return self;
	})();

	return utils;
});


