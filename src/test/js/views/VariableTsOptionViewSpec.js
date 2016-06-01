/* jslint browser: true */

/* global expect */

define([
	'jquery',
	'underscore',
	'backbone',
	'utils/VariableParameter',
	'views/VariableTsOptionView'
], function($, _, Backbone, VariableParameter, VariableTsOptionView) {
	"use strict";

	describe('views/VariableTsOptionView', function() {
		var testView;
		var testModel;
		var $testTable;

		beforeEach(function() {
			$('body').append('<table id="test-table"><tbody><tr></tr></tbody></table>');
			$testTable = $('#test-table');

			testModel = new Backbone.Model();
			testModel.set('variableParameter', new VariableParameter({
				name : 'Dataset1',
				colName : 'Column Name'
			}));
			testModel.set('timeSeriesOptions', [
				{statistic : 'raw'},
				{statistic : 'Min', timeSpan : '24'}
			]);

			testView = new VariableTsOptionView({
				el : $testTable.find('tr'),
				model : testModel
			});
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testTable.remove();
		});

		describe('Tests for render', function() {

			beforeEach(function() {
				testView.render();
			});

			it('Expects that the the stats inputs reflect the statistics in the time series options', function() {
				var $rawInput = $testTable.find('input[name="raw"]');
				var $minInput = $testTable.find('input[name="Min"]');
				var $maxInput = $testTable.find('input[name="Max"]');

				expect($rawInput.is(':checked')).toBe(true);
				expect($minInput.val()).toEqual('24');
				expect($maxInput.val()).toEqual('');
			});
		});

		describe('Model event listener tests', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that if raw is removed from the timeSeriesOptions, the raw box is unchecked', function() {
				var $rawInput = $testTable.find('input[name="raw"]');
				var $minInput = $testTable.find('input[name="Min"]');
				var $maxInput = $testTable.find('input[name="Max"]');
				testModel.set('timeSeriesOptions', [
					{statistic : 'Min', timeSpan : '24'}
				]);
				expect($rawInput.is(':checked')).toBe(false);
				expect($minInput.val()).toEqual('24');
				expect($maxInput.val()).toEqual('');
			});

			it('Expects that if min is updated, the DOM reflects the new value', function() {
				var $rawInput = $testTable.find('input[name="raw"]');
				var $minInput = $testTable.find('input[name="Min"]');
				var $maxInput = $testTable.find('input[name="Max"]');
				testModel.set('timeSeriesOptions', [
					{statistic : 'raw'},
					{statistic : 'Min', timeSpan : '24'},
					{statistic : 'Min', timeSpan : '48'}
				]);
				expect($rawInput.is(':checked')).toBe(true);
				expect($minInput.val()).toEqual('24, 48');
				expect($maxInput.val()).toEqual('');
			});

			it('Expects that if min is removed, the min input is blank', function() {
				var $rawInput = $testTable.find('input[name="raw"]');
				var $minInput = $testTable.find('input[name="Min"]');
				var $maxInput = $testTable.find('input[name="Max"]');
				testModel.set('timeSeriesOptions', [
					{statistic : 'raw'}
				]);
				expect($rawInput.is(':checked')).toBe(true);
				expect($minInput.val()).toEqual('');
				expect($maxInput.val()).toEqual('');
			});

			it('Expects that if max is added, the max input is updated', function() {
				var $rawInput = $testTable.find('input[name="raw"]');
				var $minInput = $testTable.find('input[name="Min"]');
				var $maxInput = $testTable.find('input[name="Max"]');
				testModel.set('timeSeriesOptions', [
					{statistic : 'raw'},
					{statistic : 'Min', timeSpan : '24'},
					{statistic : 'Max', timeSpan : '2'}
				]);
				expect($rawInput.is(':checked')).toBe(true);
				expect($minInput.val()).toEqual('24');
				expect($maxInput.val()).toEqual('2');
			});
		});

		describe('DOM event listeners', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that if raw is unchecked and then checked, the model is updated', function() {
				var $rawInput = $testTable.find('input[name="raw"]');
				var tsOptions;
				var isRawStat = function(tsOption) {
					return tsOption.statistic === 'raw';
				};
				$rawInput.prop('checked', false).trigger('change');
				tsOptions = _.filter(testModel.get('timeSeriesOptions'), isRawStat);

				expect(tsOptions).toEqual([]);

				$rawInput.prop('checked', true).trigger('change');
				tsOptions = _.filter(testModel.get('timeSeriesOptions'), isRawStat);

				expect(tsOptions).toEqual([{statistic : 'raw'}]);
			});

			it('Expects that if Min is  assigned a new value and then the value is cleared, that the model is updated', function() {
				var $minInput = $testTable.find('input[name="Min"]');
				var tsOptions;
				var isMinStat = function(tsOption) {
					return tsOption.statistic === 'Min';
				};
				$minInput.val('48').trigger('change');
				tsOptions = _.filter(testModel.get('timeSeriesOptions'), isMinStat);

				expect(tsOptions).toEqual([{statistic : 'Min', timeSpan : '48'}]);

				$minInput.val('24, 48').trigger('change');
				tsOptions = _.filter(testModel.get('timeSeriesOptions'), isMinStat);

				expect(tsOptions.length).toBe(2);
				expect(_.find(tsOptions, {statistic : 'Min', timeSpan : '24'})).toBeDefined();
				expect(_.find(tsOptions, {statistic : 'Min', timeSpan : '48'})).toBeDefined();

				$minInput.val('').trigger('change');
				tsOptions = _.filter(testModel.get('timeSeriesOptions'), isMinStat);

				expect(tsOptions).toEqual([]);
			});

			it('Expects that if a numeric stat is assigned a non numeric value, the timeSpan options for that statistic are cleared', function() {
				var $minInput = $testTable.find('input[name="Min"]');
				var isMinStat = function(tsOption) {
					return tsOption.statistic === 'Min';
				};
				var tsOptions;
				$minInput.val('z').trigger('change');
				tsOptions = _.filter(testModel.get('timeSeriesOptions'), isMinStat);

				expect(tsOptions).toEqual([]);
			});
		});
	});
});