/* jslint browser */
/* global expect */

define([
	'moment',
	'models/BaseDatasetCollection'
], function(moment, BaseDatasetCollection) {

	describe('models/BaseDatasetCollection', function() {

		describe('Tests for getModelsWithinDateFilter', function() {

			var testModel;
			var DATE_FORMAT = 'MM-DD-YYYY';

			beforeEach(function() {
				testModel = new BaseDatasetCollection([
					{id : 1, startDate : moment('01-01-2000', DATE_FORMAT), endDate : moment('01-01-2010', DATE_FORMAT)},
					{id : 2, startDate : moment('01-01-2001', DATE_FORMAT), endDate : moment('01-01-2011', DATE_FORMAT)},
					{id : 3, startDate : moment('01-01-2005', DATE_FORMAT), endDate : moment('01-01-2007', DATE_FORMAT)},
					{id : 4, startDate : moment('01-01-2008', DATE_FORMAT), endDate : moment('01-01-2012', DATE_FORMAT)}
				]);
			});

			it ('Expects that if either the startDate or endDate is falsy, the entire collection is returned', function() {
				expect(testModel.getModelsWithinDateFilter(moment('01-01-2003', DATE_FORMAT), '').length).toBe(4);
				expect(testModel.getModelsWithinDateFilter('', moment('01-01-2003', DATE_FORMAT)).length).toBe(4);
			});

			it('Expects that only models within the date range will be returned', function() {
				var results;
				results = testModel.getModelsWithinDateFilter(moment('03-01-2003', DATE_FORMAT), moment('01-01-2004', DATE_FORMAT));
				expect(results.length).toBe(2);

				results = testModel.getModelsWithinDateFilter(moment('01-01-1999', DATE_FORMAT), moment('01-01-2014', DATE_FORMAT));
				expect(results.length).toBe(4);

				results = testModel.getModelsWithinDateFilter(moment('01-01-2013', DATE_FORMAT), moment('01-01-2015', DATE_FORMAT));
				expect(results.length).toBe(0);
			});
		});
	});
});