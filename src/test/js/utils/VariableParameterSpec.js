/* jslint browser: true */
/* global expect */

define([
	'utils/VariableParameter'
], function(VariableParameter) {
	describe('utils/VariableParameter', function() {
		var testObject;

		describe('Tests for getUrlParameters', function() {

			beforeEach(function() {
				testObject = new VariableParameter({
					name : 'DatasetId',
					siteNo : '145:88',
					value : '145:88:77',
					colName : 'Temperature'
				});
			});

			it('Expects that if no timeSeriesOptions are passed, the empty array is returned', function() {
				expect(testObject.getUrlParameters([])).toEqual([]);
			});

			it('Expects that if the timeSeriesOptions are passed a single value and the statistic value is raw, no statistic is appended to the value', function() {
				expect(testObject.getUrlParameters([{statistic : 'raw'}])).toEqual([{
					name : 'DatasetId',
					siteNo : '145:88',
					value : '145:88:77!Temperature'
				}]);
			});

			it('Expects that if the timeSeriesOption is passed a statistic other than raw then the value and col name reflect the statistic', function() {
				expect(testObject.getUrlParameters([{statistic : 'Min', timeSpan : '24'}])).toEqual([{
					name : 'DatasetId',
					siteNo: '145:88',
					value : '145:88:77:Min:24!Temperature Min 24 hr'
				}]);
			});

			it('Expects that if more than two time series options are specified the returned array will contain two objects', function() {
				var tsOptions = [{
					statistic : 'Min',
					timeSpan : '2'
				}, {
					statistic : 'Max',
					timeSpan : '24'
				}];
				expect(testObject.getUrlParameters(tsOptions).length).toBe(2);
			});
		});
	});
});