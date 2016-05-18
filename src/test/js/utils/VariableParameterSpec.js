/* jslint browser: true */
/* global expect */

define([
	'utils/VariableParameter'
], function(VariableParameter) {
	describe('utils/VariableParameter', function() {
		var testObject;

		beforeEach(function() {
			testObject = new VariableParameter({
				name : 'DatasetId',
				value : '145:88:77',
				colName : 'Temperature'
			});
		});

		describe('Tests for getUrlParameterString', function() {
			it('Expects the statParam and statColName to be added to the returned string', function() {
				expect(testObject.getUrlParameterString('Min:2', 'Minimum 2 hours')).toEqual('DatasetId=145:88:77:Min:2!Temperature Minimum 2 hours');
			});

			it('Expects that if statParam is the null string, only the variable value is in the url', function() {
				expect(testObject.getUrlParameterString('', 'Minimum 2 hours')).toEqual('DatasetId=145:88:77!Temperature Minimum 2 hours');
			});

			it('Expects that if statColName is the null string, only the variable colName is in the url', function() {
				expect(testObject.getUrlParameterString('Min:2', '')).toEqual('DatasetId=145:88:77:Min:2!Temperature');
			});

			it('Expects that if both statParam and statColName is the null string, only the variable value and colName will be used in the url', function() {
				expect(testObject.getUrlParameterString('', '')).toEqual('DatasetId=145:88:77!Temperature');
			});
		});
	});
});