/* jslint browser: true */
/* global expect, spyOn */

define([
	'jquery',
	'underscore',
	'moment',
	'bootstrap-datetimepicker',
	'backbone',
	'Config',
	'views/DataDateFilterView'
], function($, _, moment, datetimepicker, Backbone, Config, DataDateFilterView) {
	"use strict";

	describe('views/DataDateFilterView', function() {
		var testView;
		var testModel;
		var $testDiv;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			spyOn($.fn, 'datetimepicker').and.callThrough();

			testModel = new Backbone.Model();
			testView = new DataDateFilterView({
				el : $testDiv,
				model : testModel
			});
		});

		afterEach(function() {
			testView.remove();
			$testDiv.remove();
		});

		describe('Tests for render', function() {
			it('Expects start and end date fields to be initialized with the datetimepicker', function() {
				testView.render();

				expect($.fn.datetimepicker.calls.count()).toBe(2);
				expect(_.some($.fn.datetimepicker.calls.all(), function(arg) {
					return arg.object.attr('id') === 'start-date-div';
				})).toBe(true);
				expect(_.some($.fn.datetimepicker.calls.all(), function(arg) {
					return arg.object.attr('id') === 'end-date-div';
				})).toBe(true);
			});

			it('Expects that if the model does not contain the dataDateFilter property, the value of the date widgets is null', function() {
				testView.render();

				expect($('#start-date').val()).toEqual('');
				expect($('#end-date').val()).toEqual('');
			});

			it('Expects that if the model has the dataDateFilter property set, the value of the date widgets reflects that', function() {
				testModel.set('dataDateFilter', {start : moment('2002-04-04', Config.DATE_FORMAT), end : moment('2004-01-01', Config.DATE_FORMAT)});
				testView.render();

				expect($('#start-date').val()).toEqual('2002-04-04');
				expect($('#end-date').val()).toEqual('2004-01-01');
			});
		});

		describe('Tests for model event handlers', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that when the model\'s dataDateFilter property is updated, the date fields are updated', function() {
				var $startDateDiv = $('#start-date-div');
				var $endDateDiv = $('#end-date-div');
				testModel.set('dataDateFilter', {start : moment('2002-01-02', Config.DATE_FORMAT), end : ''});

				expect($startDateDiv.data('DateTimePicker').date().format(Config.DATE_FORMAT)).toEqual('2002-01-02');
				expect($endDateDiv.data('DateTimePicker').date()).toBeNull();
				expect($endDateDiv.data('DateTimePicker').minDate().format(Config.DATE_FORMAT)).toEqual('2002-01-02');

				testModel.set('dataDateFilter', {start : moment('2002-01-02', Config.DATE_FORMAT), end : moment('2003-04-15', Config.DATE_FORMAT)});

				expect($startDateDiv.data('DateTimePicker').date().format(Config.DATE_FORMAT)).toEqual('2002-01-02');
				expect($startDateDiv.data('DateTimePicker').maxDate().format(Config.DATE_FORMAT)).toEqual('2003-04-15');
				expect($endDateDiv.data('DateTimePicker').date().format(Config.DATE_FORMAT)).toEqual('2003-04-15');
				expect($endDateDiv.data('DateTimePicker').minDate().format(Config.DATE_FORMAT)).toEqual('2002-01-02');
			});

			it('Expects that if the dataDateFilter property is unset, the date fields will be set to null', function() {
				var $startDateDiv = $('#start-date-div');
				var $endDateDiv = $('#end-date-div');
				testModel.set('dataDateFilter', {start : moment('2002-01-02', Config.DATE_FORMAT), end : moment('2003-04-15', Config.DATE_FORMAT)});
				testModel.unset('dataDateFilter');

				expect($startDateDiv.data('DateTimePicker').date()).toBeNull();
				expect($startDateDiv.data('DateTimePicker').maxDate().format(Config.DATE_FORMAT)).toEqual(moment().format(Config.DATE_FORMAT));
				expect($endDateDiv.data('DateTimePicker').date()).toBeNull();
				expect($endDateDiv.data('DateTimePicker').minDate()).toBe(false);
			});
		});

		describe('Tests for DOM event handlers', function() {

			beforeEach(function() {
				testView.render();
			});

			it('Expects that updating the start date input updates the dataDateFilter\'s start property', function() {
				var $startDate = $('#start-date');
				var result;
				$startDate.val('2001-02-05').trigger('change');
				result = testModel.get('dataDateFilter');

				expect(result.start.format(Config.DATE_FORMAT)).toEqual('2001-02-05');
				expect(result.end).toEqual('');

				$startDate.val('').trigger('change');
				result = testModel.get('dataDateFilter');

				expect(result.start).toEqual('');
				expect(result.end).toEqual('');
			});

			it('Expects that updating the end date input updates the dataDateFilter\'s end property', function() {
				var $endDate = $('#end-date');
				var result;
				$endDate.val('2001-02-05').trigger('change');
				result = testModel.get('dataDateFilter');

				expect(result.start).toEqual('');
				expect(result.end.format(Config.DATE_FORMAT)).toEqual('2001-02-05');

				$endDate.val('').trigger('change');
				result = testModel.get('dataDateFilter');

				expect(result.start).toEqual('');
				expect(result.end).toEqual('');
			});
		});
	});
});