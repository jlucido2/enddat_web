/* jslint browser: true */
/* global spyOn, expect, jasmine */

define([
	'squire',
	'jquery',
	'moment',
	'Config',
	'bootstrap-datetimepicker',
	'utils/VariableParameter',
	'models/WorkflowStateModel',
	'models/BaseVariableCollection',
	'views/BaseView'
], function(Squire, $, moment, Config, datetimepicker, VariableParameter, WorkflowStateModel, BaseVariableCollection, BaseView) {
	describe('views/ProcessDataView', function() {
		var testView, ProcessDataView;
		var $testDiv;
		var testModel;

		var setElVariableTsOptionView, renderVariableTsOptionView, removeVariableTsOptionView;

		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			setElVariableTsOptionView = jasmine.createSpy('setElVariableTsOptionView');
			renderVariableTsOptionView = jasmine.createSpy('renderVariableTsOptionView');
			removeVariableTsOptionView = jasmine.createSpy('removeVariableTsOptionView');

			injector = new Squire();

			injector.mock('views/VariableTsOptionView', BaseView.extend({
				setElement : setElVariableTsOptionView.and.returnValue({
					render : renderVariableTsOptionView
				}),
				render : renderVariableTsOptionView,
				remove : removeVariableTsOptionView
			}));

			injector.mock('jquery', $);
			injector.mock('bootstrap-datetimepicker', datetimepicker);

			injector.require(['views/ProcessDataView'], function(view) {
				ProcessDataView = view;

				var variableCollection = new BaseVariableCollection([
					{x : '2', y: '2', selected : true, variableParameter : new VariableParameter({name : 'DatasetId', value : '2:2', colName : 'Var1'})},
					{x : '3', y: '3', selected : true, variableParameter : new VariableParameter({name : 'DatasetId', value : '3:3', colName : 'Var1'})}
				]);

				testModel = new WorkflowStateModel({
					step : Config.PROCESS_DATA_STEP,
					outputDateRange : {
						start : moment('2001-02-05', Config.DATE_FORMAT),
						end : moment('2005-04-01', Config.DATE_FORMAT)
					}
				});

				spyOn(testModel, 'getSelectedVariables').and.returnValue(variableCollection.models);

				testView = new ProcessDataView({
					el : $testDiv,
					model : testModel
				});

				done();
			});
		});

		afterEach(function() {
			injector.remove();
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

			it('Expects that a variableTsOptionView is created for each selected variable', function() {
				expect(renderVariableTsOptionView.calls.count()).toBe(2);
				expect(testView.variableTsOptionViews.length).toBe(2);
			});
		});

		describe('Tests for remove', function() {
			beforeEach(function() {
				spyOn(testModel, 'getSelectedVarsDateRange').and.returnValue({
					start : moment('2000-01-04', Config.DATE_FORMAT),
					end : moment('2005-06-01', Config.DATE_FORMAT)
				});
				testView.render();
			});

			it('The variableTsOptionView remove will be called  for all the created sub views', function() {
				testView.remove();
				expect(removeVariableTsOptionView.calls.count()).toBe(2);
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

			it('Expects that if the start date picker is updated, the model is updated', function() {
				var result;
				$('#output-start-date').val('2003-01-04').trigger('change');
				result = testModel.get('outputDateRange');

				expect(result.start.format(Config.DATE_FORMAT)).toEqual('2003-01-04');
				expect(result.end.format(Config.DATE_FORMAT)).toEqual('2005-04-01');
			});

			it('Expects that if end date picker is updated, the model is update', function() {
				var result;
				$('#output-end-date').val('2004-11-01').trigger('change');
				result = testModel.get('outputDateRange');

				expect(result.start.format(Config.DATE_FORMAT)).toEqual('2001-02-05');
				expect(result.end.format(Config.DATE_FORMAT)).toEqual('2004-11-01');
			});

			it('Expects that if the start date picker is cleared, the model\'s outputDateRange.start is set to the end of the selected variable range', function() {
				$('#output-start-date').val('2003-01-04').trigger('change');
				$('#output-start-date').val('').trigger('change');
				expect(testModel.get('outputDateRange').start.format(Config.DATE_FORMAT)).toEqual('2000-01-04');
			});

			it('Expects that if the end date picker is cleared, the model\'s outputDateRange.end is set to the end of the selected variable range', function() {
				$('#output-end-date').val('2004-01-04').trigger('change');
				$('#output-end-date').val('').trigger('change');
				expect(testModel.get('outputDateRange').end.format(Config.DATE_FORMAT)).toEqual('2005-06-01');
			});
		});
	});
});