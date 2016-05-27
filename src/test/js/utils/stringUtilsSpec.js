/* jslint browser: true */
/* global expect */

define([
	'utils/stringUtils'
], function(stringUtils) {
	describe('utils/StringUtils', function() {

		describe('Tests for toTitleCase', function() {
			it('Expects that a string containing no spaces will only have the first letter capitalized', function() {
				expect(stringUtils.toTitleCase('thisisatest')).toEqual('Thisisatest');
			});

			it('Expects that a string will have each letter following a space capitalized', function() {
				expect(stringUtils.toTitleCase('this is a test')).toEqual('This Is A Test');
			});

			it('Expects that a string which contains numbers starting words in properly capitalized', function() {
				expect(stringUtils.toTitleCase('this 123b is a test')).toEqual('This 123b Is A Test');
			});
		});
	});
});