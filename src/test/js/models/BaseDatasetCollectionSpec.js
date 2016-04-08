/* jslint browser */
/* global expect */

define([
	'models/BaseDatasetCollection'
], function(BaseDatasetCollection) {

	fdescribe('models/BaseDatasetCollection', function() {

		describe('Tests for getModelsWithinDateFilter', function() {

			var testModel;

			beforeEach(function() {
				testModel = new BaseDatasetCollection([
					{id : 1, startDate : '01-01-2000', endDate : '01-01-2010'},
					{id : 2, startDate : '01-01-2001', endDate : '01-01-2011'},
					{id : 3, startDate : '01-01-2005', endDate : '01-01-2007'},
					{id : 4, startDate : '01-01-2008', endDate : '01-01-2012'}
				]);
			});

			it ('Expects that if either the startDate or endDate is falsy, the entire collection is returned', function() {
				expect(testModel.getModelsWithinDateFilter('01-01-2003', '').length).toBe(4);
				expect(testModel.getModelsWithinDateFilter('', '01-01-2003').length).toBe(4);
			});

			it('Expects that only models within the date range will be returned', function() {
				var results;
				results = testModel.getModelsWithinDateFilter('03-01-2003', '01-01-2004');
				expect(results.length).toBe(2);

				results = testModel.getModelsWithinDateFilter('01-01-1999', '01-01-2014');
				expect(results.length).toBe(4);

				results = testModel.getModelsWithinDateFilter('01-01-2013', '01-01-2015');
				expect(results.length).toBe(0);
			});
		});
	});
});