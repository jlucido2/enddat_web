/* jslint browser: true */
/* global spyOn, expect */

define([
	'jquery',
	'moment',
	'Config',
	'models/WorkflowStateModel',
	'views/ProcessDataView'
], function($, moment, Config, WorkflowStateModel, ProcessDataView) {
	describe('views/ProcessDataView', function() {
		var testView;
		var $testDiv;
		var testModel;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');
			testModel = new WorkflowStateModel({
				step : Config.PROCESS_DATA_STEP,
				outputDateRange : {
					start : moment('2001-02-05', Config.DATE_FORMAT),
					end : moment('2005-04-01', Config.DATE_FORMAT)
				}
			});

			testView = new ProcessDataView({
				el : $testDiv,
				model : testModel
			});
		});

		afterEach(function() {
			testView.remove();
			$testDiv.remove();
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				spyOn(testModel, 'getSelectedVarsDateRange').and.returnValue({
					start : moment('2000-01-04', Config.DATE_FORMAT),
					end : moment('2005-06-01', Config.DATE_FORMAT)
				});
				testView.render();
			});

			it('Expects that the date pickers are initialized using the outputDateRange in the model', function() {
				expect($testDiv.find('#output-start-date').val()).toEqual('2001-02-05');
				expect($testDiv.find('#output-end-date').val()).toEqual('2005-04-01');
			});

			it('Expects that the date pickers min and max dates are set correctly', function() {
				var $startDate = $('#output-start-date-div');
				var $endDate = $('#output-end-date-div');

				expect($startDate.data('DateTimePicker').minDate()).toEqual(moment('2000-01-04', Config.DATE_FORMAT));
				expect($startDate.data('DateTimePicker').maxDate()).toEqual(moment('2005-04-01', Config.DATE_FORMAT));
				expect($endDate.data('DateTimePicker').minDate()).toEqual(moment('2001-02-05', Config.DATE_FORMAT));
				expect($endDate.data('DateTimePicker').maxDate()).toEqual(moment('2005-06-01', Config.DATE_FORMAT));
			});
		});

		describe('Model event listener tests', function() {
			beforeEach(function() {
				spyOn(testModel, 'getSelectedVarsDateRange').and.returnValue({
					start : moment('2000-01-04', Config.DATE_FORMAT),
					end : moment('2005-06-01', Config.DATE_FORMAT)
				});
				testView.render();
			});

			it('Expects that if the outputDateFormat changes, the date time picker inputs will be updated', function() {
				var $startDate = $('#output-start-date-div');
				var $endDate = $('#output-end-date-div');
				testModel.set('outputDateRange', {
					start : moment('2002-01-04', Config.DATE_FORMAT),
					end : moment('2004-01-04', Config.DATE_FORMAT)
				});

				expect($startDate.data('DateTimePicker').minDate()).toEqual(moment('2000-01-04', Config.DATE_FORMAT));
				expect($startDate.data('DateTimePicker').maxDate()).toEqual(moment('2004-01-04', Config.DATE_FORMAT));
				expect($startDate.data('DateTimePicker').date()).toEqual(moment('2002-01-04', Config.DATE_FORMAT));
				expect($endDate.data('DateTimePicker').minDate()).toEqual(moment('2002-01-04', Config.DATE_FORMAT));
				expect($endDate.data('DateTimePicker').maxDate()).toEqual(moment('2005-06-01', Config.DATE_FORMAT));
				expect($endDate.data('DateTimePicker').date()).toEqual(moment('2004-01-04', Config.DATE_FORMAT));
			});
		});

		describe('DOM event listener tests', function() {
			beforeEach(function() {
				spyOn(testModel, 'getSelectedVarsDateRange').and.returnValue({
					start : moment('2000-01-04', Config.DATE_FORMAT),
					end : moment('2005-06-01', Config.DATE_FORMAT)
				});
				testView.render();
			});

			it('Expects that if the start date date time picker is updated, the model is updated', function() {
				var result;
				$('#output-start-date').val('2003-01-04').trigger('change');
				result = testModel.get('outputDateRange');

				expect(result.start.format(Config.DATE_FORMAT)).toEqual('2003-01-04');
				expect(result.end.format(Config.DATE_FORMAT)).toEqual('2005-04-01');
			});

			it('Expects that if end date picer is updated, the model is update', function() {
				var result;
				$('#output-end-date').val('2004-11-01').trigger('change');
				result = testModel.get('outputDateRange');

				expect(result.start.format(Config.DATE_FORMAT)).toEqual('2001-02-05');
				expect(result.end.format(Config.DATE_FORMAT)).toEqual('2004-11-01');
			});
		});
	});
});