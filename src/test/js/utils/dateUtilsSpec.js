/* jslint browser: true */
/* global expect */

define([
	'moment',
	'utils/dateUtils'
], function(moment, dateUtils) {
	describe('utils/dateUtils', function() {
		var DATE_FORMAT = 'YYYY-MM-DD';

		describe('Tests for inDateRange', function() {
			var dateRange = {
				start : moment('2010-01-01', DATE_FORMAT),
				end : moment('2015-03-01', DATE_FORMAT)
			};

			it('Expects that if a date is outside dateRange, false is returned', function() {
				expect(dateUtils.inDateRange(moment ('2009-12-31', DATE_FORMAT), dateRange)).toBe(false);
				expect(dateUtils.inDateRange(moment('2015-03-02', DATE_FORMAT), dateRange)).toBe(false);
			});

			it('Expects that a date within the dateRange returns true', function() {
				expect(dateUtils.inDateRange(moment('2012-06-23', DATE_FORMAT), dateRange)).toBe(true);
				expect(dateUtils.inDateRange(moment('2010-01-01', DATE_FORMAT), dateRange)).toBe(true);
				expect(dateUtils.inDateRange(moment('2015-03-01', DATE_FORMAT), dateRange)).toBe(true);
			});
		});

		describe('Tests for dateRangeOverlaps', function() {
			var dateRange2 = {
				start : moment('2010-01-01', DATE_FORMAT),
				end : moment('2015-03-01', DATE_FORMAT)
			};

			it('Expects that a date range that starts before but ends during dateRange2 returns true', function() {
				var dateRange1 = {
					start : moment('2009-12-12', DATE_FORMAT),
					end : moment('2014-04-01', DATE_FORMAT)
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(true);
			});

			it('Expects that a date range that starts after but ends after dateRange2 returns true', function() {
				var dateRange1 = {
					start : moment('2010-12-12', DATE_FORMAT),
					end : moment('2015-04-01', DATE_FORMAT)
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(true);
			});

			it('Expects that a date range completely within dateRange2 returns true', function() {
				var dateRange1 = {
					start : moment('2010-12-12', DATE_FORMAT),
					end : moment('2014-04-01', DATE_FORMAT)
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(true);
			});

			it('Expects that a date range where start begins before dateRange2 and ends after returns true', function() {
				var dateRange1 = {
					start : moment('2009-12-12', DATE_FORMAT),
					end : moment('2016-04-01', DATE_FORMAT)
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(true);
			});

			it('Expects that a date range that ends before the start of dateRange2 returns false', function() {
				var dateRange1 = {
					start : moment('2001-12-12', DATE_FORMAT),
					end : moment('2009-12-12', DATE_FORMAT)
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(false);
			});

			it('Expects that a date range that starts after the end of dateRange2 returns false', function() {
				var dateRange1 = {
					start : moment('2015-12-12', DATE_FORMAT),
					end : moment('2016-12-12', DATE_FORMAT)
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(false);
			});
		});
	});
});


