/* jslint browser: true */
/* global expect */

define([
	'utils/VariableParameter'
], function(VariableParameter) {
	describe('utils/VariableParameter', function() {
		var testObject;

		describe('Tests for getUrlParameter', function() {

			it('Expects the if the timeSeriesOption , nothing gets appended to the value or column name', function() {
				testObject = new VariableParameter({
					name : 'DatasetId',
					value : '145:88:77',
					colName : 'Temperature',
					timeSeriesOption : {statistic : 'raw'}
				});

				expect(testObject.getUrlParameter()).toEqual({
					name : 'DatasetId',
					value : '145:88:77!Temperature'
				});
			});

			it('Expects that if the statistic is not raw, the value and col name contain the timeSeriesOption parameters', function() {
				testObject = new VariableParameter({
					name : 'DatasetId',
					value : '145:88:77',
					colName : 'Temperature',
					timeSeriesOption : {statistic : 'Min', colName : 'Minimum', timeSpan : 2}
				});

				expect(testObject.getUrlParameter()).toEqual({
					name : 'DatasetId',
					value : '145:88:77:Min:2!Temperature Minimum 2 hr'
				});
			});
		});
	});
});