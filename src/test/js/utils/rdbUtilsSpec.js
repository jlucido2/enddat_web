/* jslint browser: true */
/* global expect */

define([
	'underscore',
	'utils/rdbUtils'
], function(_, rdbUtils) {
	describe('utils/rdbUtils', function() {
		describe('Tests for parseRDB', function() {
			it('Expects an empty string to return an empty array', function() {
				expect(rdbUtils.parseRDB('')).toEqual([]);
			});

			it('Expects that an rdb string that contains no data lines to return an empty array', function() {
				var testString = '#This is a comment\n' +
					'#This is a second comment\n' +
					'Key1\tKey2\tKey3\n' +
					'5s\t19s\t34s';
				expect(rdbUtils.parseRDB(testString)).toEqual([]);
			});

			it('Expects than an rdb string that contains data lines that end in linefeed returns the parsed data in an array', function() {
				var testString = '#This is a comment\n' +
					'#This is a second comment\n' +
					'Key1\tKey2\tKey3\n' +
					'5s\t19s\t34s\n ' +
					'Value1\t12.5\tTitle 1\n' +
					'Value2\t22.5\tTitle 2\n' +
					'Value3\t32.5\tTitle 3';
				var result = rdbUtils.parseRDB(testString);
				expect(result.length).toBe(3);
				expect(_.contains(result, {
					'Key1' : 'Value1',
					'Key2' : '12.5',
					'Key3' : 'Title 1'
				}));expect(_.contains(result, {
					'Key1' : 'Value2',
					'Key2' : '22.5',
					'Key3' : 'Title 2'
				}));expect(_.contains(result, {
					'Key1' : 'Value3',
					'Key2' : '32.5',
					'Key3' : 'Title 3'
				}));
			});

			it('Expects than an rdb string that contains data lines that end in carriage return and then  linefeed returns the parsed data in an array', function() {
				var testString = '#This is a comment\r\n' +
					'#This is a second comment\r\n' +
					'Key1\tKey2\tKey3\r\n' +
					'5s\t19s\t34s\r\n ' +
					'Value1\t12.5\tTitle 1\r\n' +
					'Value2\t22.5\tTitle 2\r\n' +
					'Value3\t32.5\tTitle 3';
				var result = rdbUtils.parseRDB(testString);
				expect(result.length).toBe(3);
				expect(_.contains(result, {
					'Key1' : 'Value1',
					'Key2' : '12.5',
					'Key3' : 'Title 1'
				}));expect(_.contains(result, {
					'Key1' : 'Value2',
					'Key2' : '22.5',
					'Key3' : 'Title 2'
				}));expect(_.contains(result, {
					'Key1' : 'Value3',
					'Key2' : '32.5',
					'Key3' : 'Title 3'
				}));
			});
		});
	});
});