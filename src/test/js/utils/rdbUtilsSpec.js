/* jslint browser: true */
/* global expect */

define([
	'utils/rdbUtils'
], function(rdbUtils) {
	fdescribe('utils/rdbUtils', function() {
		describe('Tests for parseRDB', function() {
			it('Expects an empty string to return an empty array', function() {
				expect(rdbUtils.parseRDB('')).toEqual([]);
			});

			it('Expects that an rdb string that contains no data lines to return an empty array', function() {
				var testString = '#This is a comment\n' +
					'#This is a second comment\n' +
					'Key1\tKey2\tKey3\n' +
					'5s 19s 34s';
				expect(rdbUtils.parseRDB(testString)).toEqual([]);
			});

			it('Expects than an rdb string that contains data lines returns the parsed data in an array', function() {
				
			})
		});
	});
});