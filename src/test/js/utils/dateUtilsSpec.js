/* jslint browser: true */
/* global expect */

define([
	'utils/dateUtils'
], function(dateUtils) {
	describe('utils/dateUtils', function() {
		describe('Tests for inDateRange', function() {
			var dateRange = {
				start : new Date('01-01-2010'),
				end : new Date('03-01-2015')
			};

			it('Expects that if a date is outside dateRange, false is returned', function() {
				expect(dateUtils.inDateRange(new Date('12-31-2009'), dateRange)).toBe(false);
				expect(dateUtils.inDateRange(new Date('03-02-2015'), dateRange)).toBe(false);
			});

			it('Expects that a date within the dateRange returns true', function() {
				expect(dateUtils.inDateRange(new Date('06-23-2012'), dateRange)).toBe(true);
				expect(dateUtils.inDateRange(new Date('01-01-2010'), dateRange)).toBe(true);
				expect(dateUtils.inDateRange(new Date('03-01-2015'), dateRange)).toBe(true);
			});
		});

		describe('Tests for dateRangeOverlaps', function() {
			var dateRange2 = {
				start : new Date('01-01-2010'),
				end : new Date('03-01-2015')
			};

			it('Expects that a date range that starts before but ends during dateRange2 returns true', function() {
				var dateRange1 = {
					start : new Date('12-12-2009'),
					end : new Date('04-01-2014')
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(true);
			});

			it('Expects that a date range that starts after but ends after dateRange2 returns true', function() {
				var dateRange1 = {
					start : new Date('12-12-2010'),
					end : new Date('04-01-2015')
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(true);
			});

			it('Expects that a date range completely within dateRange2 returns true', function() {
				var dateRange1 = {
					start : new Date('12-12-2010'),
					end : new Date('04-01-2014')
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(true);
			});

			it('Expects that a date range where start begins before dateRange2 and ends after returns true', function() {
				var dateRange1 = {
					start : new Date('12-12-2009'),
					end : new Date('04-01-2016')
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(true);
			});

			it('Expects that a date range that ends before the start of dateRange2 returns false', function() {
				var dateRange1 = {
					start : new Date('12-12-2001'),
					end : new Date('12-12-2009')
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(false);
			});

			it('Expects that a date range that starts after the end of dateRange2 returns false', function() {
				var dateRange1 = {
					start : new Date('12-12-2015'),
					end : new Date('12-12-2015')
				};
				expect(dateUtils.dateRangeOverlaps(dateRange1, dateRange2)).toBe(false);
			});
		});
	});
});


