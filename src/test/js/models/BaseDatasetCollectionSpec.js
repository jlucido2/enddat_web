/* jslint browser */
/* global expect */

define([
	'moment',
	'underscore',
	'utils/VariableParameter',
	'models/BaseDatasetCollection',
	'models/BaseVariableCollection'
], function(moment, _, VariableParameter, BaseDatasetCollection, BaseVariableCollection) {
	"use strict";

	fdescribe('models/BaseDatasetCollection', function() {

		var DATE_FORMAT = 'MM-DD-YYYY';

		describe('Tests for hasSelectedVariables', function() {
			var testCollection;

			it('Expects that an empty collection returns false', function() {
				testCollection = new BaseDatasetCollection();

				expect(testCollection.hasSelectedVariables()).toBe(false);
			});

			it('Expects that a collection with no selected variables returns false', function() {
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new BaseVariableCollection([{x : 1}, {x : 2}])},
					{id : 2, variables : new BaseVariableCollection([{x : 3}])}
				]);

				expect(testCollection.hasSelectedVariables()).toBe(false);
			});

			it('Expects that a collection with selected variables returns true', function() {
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new BaseVariableCollection([{x : 1, selected: true}, {x : 2}])},
					{id : 2, variables : new BaseVariableCollection([{x : 3}])}
				]);

				expect(testCollection.hasSelectedVariables()).toBe(true);
			});
		});

		describe('Tests for getSelectedVariables', function() {
			var testCollection;

			it('Expects that an empty collection returns an empty array', function() {
				testCollection = new BaseDatasetCollection();

				expect(testCollection.getSelectedVariables()).toEqual([]);
			});

			it('Expects that a collection with no selected variables returns an empty array', function() {
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new BaseVariableCollection([{x : 1}, {x : 2}])},
					{id : 2, variables : new BaseVariableCollection([{x : 3}])},
					{id : 3, variables : new BaseVariableCollection([{x : 4}, {x: 5}])}
				]);

				expect(testCollection.getSelectedVariables()).toEqual([]);
			});

			it('Expects that a collection with selected variables returns those variables', function() {
				var result;
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new BaseVariableCollection([{x : 1, selected : true}, {x : 2}])},
					{id : 2, variables : new BaseVariableCollection([{x : 3}])},
					{id : 3, variables : new BaseVariableCollection([{x : 4, selected: true}, {x: 5, selected: true}])}
				]);

				result = testCollection.getSelectedVariables();
				expect(result.length).toBe(3);
				expect(_.find(result, function(variableModel) {
					return variableModel.attributes.x === 1;
				})).toBeDefined();
				expect(_.find(result, function(variableModel) {
					return variableModel.attributes.x === 4;
				})).toBeDefined();
				expect(_.find(result, function(variableModel) {
					return variableModel.attributes.x === 5;
				})).toBeDefined();
			});
		});

		describe('Tests for getSiteModelsWithinDateFilter', function() {

			var testCollection;

			beforeEach(function() {
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new BaseVariableCollection([
							{startDate : moment('01-01-2000', DATE_FORMAT), endDate : moment('01-01-2010', DATE_FORMAT)},
						    {startDate : moment('01-01-2001', DATE_FORMAT), endDate : moment('01-01-2011', DATE_FORMAT)}
					])},
					{id : 3, variables : new BaseVariableCollection([
							{startDate : moment('01-01-2005', DATE_FORMAT), endDate : moment('01-01-2007', DATE_FORMAT)},
							{startDate : moment('01-01-2008', DATE_FORMAT), endDate : moment('01-01-2012', DATE_FORMAT)}
					])}
				]);
			});

			it ('Expects that if either the startDate or endDate is falsy, the entire collection is returned', function() {
				expect(testCollection.getSiteModelsWithinDateFilter(moment('01-01-2003', DATE_FORMAT), '').length).toBe(2);
				expect(testCollection.getSiteModelsWithinDateFilter('', moment('01-01-2003', DATE_FORMAT)).length).toBe(2);
			});

			it('Expects that only models within the date range will be returned', function() {
				var results;
				results = testCollection.getSiteModelsWithinDateFilter(moment('03-01-2003', DATE_FORMAT), moment('01-01-2004', DATE_FORMAT));
				expect(results.length).toBe(1);

				results = testCollection.getSiteModelsWithinDateFilter(moment('01-01-1999', DATE_FORMAT), moment('01-01-2014', DATE_FORMAT));
				expect(results.length).toBe(2);

				results = testCollection.getSiteModelsWithinDateFilter(moment('01-01-2013', DATE_FORMAT), moment('01-01-2015', DATE_FORMAT));
				expect(results.length).toBe(0);
			});
		});

		describe('Tests for getSelectedVariablesUrlParams', function() {
			var VariableCollection = BaseVariableCollection.extend({
				getSelectedUrlParams : function() {
					var selectedVars = this.getSelectedVariables();
					return _.map(selectedVars, function(variableModel) {
						return new VariableParameter({
							name : 'Test1',
							value : variableModel.attributes.x + ':' + variableModel.attributes.y,
							colName : 'Var' + variableModel.attributes.x
						});
					});
				}
			});
			var testCollection;

			it('Expects that an empty collection will return an empty array', function() {
				testCollection = new BaseDatasetCollection();

				expect(testCollection.getSelectedVariablesUrlParams()).toEqual([]);
			});

			it('Expects that a collection where none of the variables are selected will return an empty array', function() {
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new VariableCollection([{x : 1, y : 1}, {x : 2, y: 2}])},
					{id : 2, variables : new VariableCollection([{x : 10, y : 10}, {x : 20, y : 20}, {x : 30, y : 30}])}
				]);

				expect(testCollection.getSelectedVariablesUrlParams()).toEqual([]);
			});

			it('Expects that a collection where some of the variables are selected will return those variables represented as parameters', function() {
				var result;
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new VariableCollection([{x : 1, y : 1, selected : true}, {x : 2, y: 2}])},
					{id : 2, variables : new VariableCollection([{x : 10, y : 10}, {x : 20, y : 20, selected: true}, {x : 30, y : 30, selected: true}])}
				]);
				result = testCollection.getSelectedVariablesUrlParams();

				expect(result.length).toBe(3);
				expect(_.find(result, function(param) {
					return (param.name === 'Test1') && (param.value === '1:1');
				})).toBeDefined();
				expect(_.find(result, function(param) {
					return (param.name === 'Test1') && (param.value === '20:20');
				})).toBeDefined();
				expect(_.find(result, function(param) {
					return (param.name === 'Test1') && (param.value === '30:30');
				})).toBeDefined();
			});
		});

		describe('Tests for getSelectedDateRange', function() {
			var testCollection;

			it('Expects an empty collection returns undefined', function() {
				testCollection = new BaseDatasetCollection();

				expect(testCollection.getSelectedDateRange()).toBeUndefined();
			});

			it('Expects a collection with no selected variables will return undefined', function() {
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new BaseVariableCollection([
							{startDate : moment('01-01-2000', DATE_FORMAT), endDate : moment('01-01-2010', DATE_FORMAT)},
						    {startDate : moment('01-01-2001', DATE_FORMAT), endDate : moment('01-01-2011', DATE_FORMAT)}
					])},
					{id : 3, variables : new BaseVariableCollection([
							{startDate : moment('01-01-2005', DATE_FORMAT), endDate : moment('01-01-2007', DATE_FORMAT)},
							{startDate : moment('01-01-2008', DATE_FORMAT), endDate : moment('01-01-2012', DATE_FORMAT)}
					])}
				]);

				expect(testCollection.getSelectedDateRange()).toBeUndefined();
			});

			it('Expects a collection with a single selected variable will return that variables date range', function() {
				var result;
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new BaseVariableCollection([
							{startDate : moment('01-01-2000', DATE_FORMAT), endDate : moment('01-01-2010', DATE_FORMAT)},
						    {startDate : moment('01-01-2001', DATE_FORMAT), endDate : moment('01-01-2011', DATE_FORMAT)}
					])},
					{id : 3, variables : new BaseVariableCollection([
							{startDate : moment('01-01-2005', DATE_FORMAT), endDate : moment('01-01-2007', DATE_FORMAT), selected: true},
							{startDate : moment('01-01-2008', DATE_FORMAT), endDate : moment('01-01-2012', DATE_FORMAT)}
					])}
				]);
				result = testCollection.getSelectedDateRange();

				expect(result.start.format(DATE_FORMAT)).toEqual('01-01-2005');
				expect(result.end.format(DATE_FORMAT)).toEqual('01-01-2007');
			});

			it('Expects a collection with multiple selected variables to return the date range of the selected variables', function() {
				var result;
				testCollection = new BaseDatasetCollection([
					{id : 1, variables : new BaseVariableCollection([
							{startDate : moment('01-01-2000', DATE_FORMAT), endDate : moment('01-01-2010', DATE_FORMAT), selected: true},
						    {startDate : moment('01-01-2001', DATE_FORMAT), endDate : moment('01-01-2011', DATE_FORMAT), selected : true}
					])},
					{id : 3, variables : new BaseVariableCollection([
							{startDate : moment('01-01-1999', DATE_FORMAT), endDate : moment('01-01-2007', DATE_FORMAT), selected: true},
							{startDate : moment('01-01-2008', DATE_FORMAT), endDate : moment('01-01-2012', DATE_FORMAT)}
					])}
				]);
				result = testCollection.getSelectedDateRange();

				expect(result.start.format(DATE_FORMAT)).toEqual('01-01-1999');
				expect(result.end.format(DATE_FORMAT)).toEqual('01-01-2011');
			});
		});
	});
});