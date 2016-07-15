/* jslint browser: true */
/* global expect */

define([
	'jquery',
	'underscore',
	'utils/VariableDatasetMapping'
], function($, _, VariableDatasetMapping) {
	"use strict";
	describe('utils/VariableDatasetMapping', function() {
		var expectedMapping = {
			"precipitation" : {
				"displayName" : "Precipitation",
				"datasets" : [
					{
						"name" : "NWIS",
						"filter" : [
							{"parameterCd" : "00045", "statCd" : "00000"},
							{"parameterCd" : "00046", "statCd" : "00000"}
						]
					},{
						"name" : "ACIS",
						"filter" : [
							{"code" : "pcpn"}
						]
					},{
						"name" : "PRECIP",
						"filter" : [{}]
					}
				]
			},
			"maxTemperature" : {
				"displayName" : "Maximum Temperature",
				"datasets" : [
					{
						"name" : "NWIS",
						"filter" : [
							{"parameterCd" : "00021", "statCd" : "00001"}
						]
					},{
						"name" : "ACIS",
						"filter" : [{"code" : "maxt"}]
					}
				]
			}
		};
		it('Expects that getMapping returns the expected mapping from the json file', function() {
			expect(_.isEqual(VariableDatasetMapping.getMapping(), expectedMapping)).toBe(true);
		});

		it('Expects that getDatasets returns an empty array if passed an empty array of variables', function() {
			expect(VariableDatasetMapping.getDatasets([])).toEqual([]);
		});

		it('Expects that getDatasets returns the expected datasets for an array of variables with no duplicates', function() {
			var datasets = VariableDatasetMapping.getDatasets(['precipitation', 'maxTemperature']);
			var expectedResult = ['NWIS', 'ACIS', 'PRECIP'];

			expect(datasets.length).toEqual(expectedResult.length);
			expect(_.difference(datasets, expectedResult)).toEqual([]);

			datasets = VariableDatasetMapping.getDatasets(['maxTemperature']);
			expectedResult = ['NWIS', 'ACIS'];

			expect(datasets.length).toEqual(expectedResult.length);
			expect(_.difference(datasets, expectedResult)).toEqual([]);
		});

		it('Expects that getFilters returns an empty array if an empty array of variables is passed', function() {
			expect(VariableDatasetMapping.getFilters('NWIS', [])).toEqual([]);
		});

		it('Expects that getFilters returns an empty array if the dataset is not in the variables array', function() {
			expect(VariableDatasetMapping.getFilters('NEW_DATASET'), ['maxTemperature', 'precipiation']).toEqual([]);
		});

		it('Expects the getFilters returns the expected filters when passed a dataset and variables array', function() {
			var expectedResults = [
				{"parameterCd" : "00045", "statCd" : "00000"},
				{"parameterCd" : "00046", "statCd" : "00000"},
				{"parameterCd" : "00021", "statCd" : "00001"}
			];
			var filters = VariableDatasetMapping.getFilters('NWIS', ['maxTemperature', 'precipitation']);
			expect(filters.length).toEqual(expectedResults.length);
			expect(_.some(filters, function(filter) {
				return _.isEqual(filter, expectedResults[0]);
			})).toBe(true);
			expect(_.some(filters, function(filter) {
				return _.isEqual(filter, expectedResults[1]);
			})).toBe(true);
			expect(_.some(filters, function(filter) {
				return _.isEqual(filter, expectedResults[2]);
			})).toBe(true);
		});
	});
});