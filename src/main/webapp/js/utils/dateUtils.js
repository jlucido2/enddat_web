/* jslint browser */

define([
	'moment'
], function(moment) {
	var utils = (function() {
		var self = {};

		/*
		 * @param {Moment} dateToTest
		 * @param {Object with start and end string properties} dateRange - properties should be parsable into Momenet objects
		 * @returns {Boolean} - True if dateToTest is with dateRange.start and dateRange.end inclusive
		 */
		self.inDateRange = function(dateToTest, dateRange) {
			return (dateToTest.isSameOrAfter(dateRange.start) &&
				dateToTest.isSameOrBefore(dateRange.end));
		};

		/*
		 * @param {Object with start and end Moment properties} dateRange1
		 * @param {Object with start and end Moment properties} dateRange2
		 * @returns {Boolean} - True if dateRange1 intersects dateRange2
		 */
		self.dateRangeOverlaps = function(dateRange1, dateRange2) {
			return (self.inDateRange(dateRange1.start, dateRange2) ||
				self.inDateRange(dateRange1.end, dateRange2) ||
				(self.inDateRange(dateRange2.start, dateRange1) && self.inDateRange(dateRange2.end, dateRange1)));
		};

		return self;
	})();

	return utils;
});


