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

			// Need to inject these so that the jquery and bootstrap datetimepicker is the same instance used in the tests
			injector.mock('jquery', $);
			injector.mock('bootstrap-datetimepicker', datetimepicker);

			injector.require(['views/ProcessDataView'], function(view) {
				ProcessDataView = view;

				var variableCollection = new BaseVariableCollection([
					{x : '2', y: '2', selected : true,
						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '2:2', value : '2:2', colName : 'Var1'}),
						timeSeriesOptions : [{statistic : 'raw'}]
					},
					{x : '3', y: '3', selected : true,
						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '3:3', value : '3:3', colName : 'Var1'}),
						timeSeriesOptions : [{statistic : 'Min', timeSpan : '2'}]}
				]);
				
				testModel = new WorkflowStateModel({
					step : Config.PROCESS_DATA_STEP,
					outputDateRange : {
						start : moment('2001-02-05', Config.DATE_FORMAT),
						end : moment('2005-04-01', Config.DATE_FORMAT)
					}
				});

				getSelectedVarSpy = spyOn(testModel, 'getSelectedVariables').and.returnValue(variableCollection.models);

				testView = new ProcessDataView({
					el : $testDiv,
					model : testModel,
					maxUrlLength : 215
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
					end : moment('2005-06-01', Config.DATE_FORMAT),
				});
				testModel.set({
					outputFileFormat : 'tab',
					outputDateFormat : 'Excel',
					outputTimeZone : '0_GMT',
					outputTimeGapInterval : '6',
					outputMissingValue : 'NaN'
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

			it('Expects the remaining configuration inputs to be initialized', function() {
				expect($testDiv.find('#output-date-format-input').val()).toEqual('Excel');
				expect($testDiv.find('#output-time-zone-input').val()).toEqual('0_GMT');
				expect($testDiv.find('#output-file-format-input').val()).toEqual('tab');
				expect($testDiv.find('#missing-value-input').val()).toEqual('NaN');
				expect($testDiv.find('#acceptable-data-gap-input').val()).toEqual('6');
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

			it('Expects the remaining output configuration DOM elements to be updated when the model is updated', function() {
				testModel.set({
					outputFileFormat : 'tab',
					outputDateFormat : 'Excel',
					outputTimeZone : '0_GMT',
					outputTimeGapInterval : '6',
					outputMissingValue : 'NaN'
				});
				expect($testDiv.find('#output-date-format-input').val()).toEqual('Excel');
				expect($testDiv.find('#output-time-zone-input').val()).toEqual('0_GMT');
				expect($testDiv.find('#output-file-format-input').val()).toEqual('tab');
				expect($testDiv.find('#missing-value-input').val()).toEqual('NaN');
				expect($testDiv.find('#acceptable-data-gap-input').val()).toEqual('6');
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

			it('Expects that if an output configuration input is updated the model is updated', function() {
				$('#output-date-format-input').val('ISO').trigger('change');
				expect(testModel.get('outputDateFormat')).toEqual('ISO');

				$('#output-time-zone-input').val('-5_CDT').trigger('change');
				expect(testModel.get('outputTimeZone')).toEqual('-5_CDT');

				$('#output-file-format-input').val('csv').trigger('change');
				expect(testModel.get('outputFileFormat')).toEqual('csv');

				$('#missing-value-input').val('999').trigger('change');
				expect(testModel.get('outputMissingValue')).toEqual('999');

				$('#acceptable-data-gap-input').val('12').trigger('change');
				expect(testModel.get('outputTimeGapInterval')).toEqual('12');
			});

			describe('DOM events for processing buttons with a long URL', function() {
				var expectedBaseUrl = 'http:fakeservice/enddat/service/execute?';
				var variableCollectionLong = new BaseVariableCollection([
					{x : '2', y: '2', selected : true,
						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '2:2', value : '2:2', colName : 'Var1'}),
						timeSeriesOptions : [{statistic : 'raw'}]
					},
					{x : '3', y: '3', selected : true,
						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '3:3', value : '3:3', colName : 'Var1'}),
						timeSeriesOptions : [{statistic : 'Min', timeSpan : '2'}]},
					{x : '4', y : '4', selected : true,
					     variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '4:4', value : '4:4', colName : 'Var3'}),
					     timeSeriesOptions : [{statistic : 'raw'}]
				    }                                                       
   				]);

				beforeEach(function() {
					getSelectedVarSpy.and.returnValue(variableCollectionLong.models);
					testModel.set({
						outputFileFormat : 'tab',
						outputDateFormat : 'Excel',
						outputTimeZone : '0_GMT',
						outputTimeGapInterval : '6',
						outputMissingValue : 'NaN',
						outputDateRange : {
							start : moment('2001-04-05', Config.DATE_FORMAT),
							end : moment('2006-06-30', Config.DATE_FORMAT)
						}
					});				
				});

				it('Expects a message be shown for more than one site url', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var expectedMsg = 'The URL for data processing exceeds the character limit. A single URL has been provided for each selected station.'
					var message = $testDiv.find('p.warning-msg').html();
				    expect(message).toEqual(expectedMsg);
				});

				it('Expects that there are three urls displayed within the URL container', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var urlCount = $testDiv.find('ul.url-links li').length;
					expect(urlCount).toEqual(3);
				});

				it('Expects urls are separated by site', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var firstUrl = decodeURIComponent($testDiv.find('ul.url-links li:nth-child(1)').html());
					var secondUrl = decodeURIComponent($testDiv.find('ul.url-links li:nth-child(2)').html());
					var thirdUrl = decodeURIComponent($testDiv.find('ul.url-links li:nth-child(3)').html());
					var firstInspect = (firstUrl.search('DatasetId=2:2!Var1') !== -1) && (firstUrl.search('DatasetId=3:3:Min:2!Var1') === -1) && (firstUrl.search('DatasetId=4:4!Var3') === -1);
					var secondInspect = (secondUrl.search('DatasetId=2:2!Var1') === -1) && (secondUrl.search('DatasetId=3:3:Min:2!Var1') !== -1 ) && (secondUrl.search('DatasetId=4:4!Var3') === -1);
					var thirdInspect = (thirdUrl.search('DatasetId=2:2!Var1') === -1) && (thirdUrl.search('DatasetId=3:3:Min:2!Var1') === -1 ) && (thirdUrl.search('DatasetId=4:4!Var3') !== -1);
					expect(firstInspect).toBe(true);
					expect(secondInspect).toBe(true);
					expect(thirdInspect).toBe(true);
				});

				it('Expects get data button to be disabled', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var isDisabled = $testDiv.find('.get-data-btn').is(':disabled');
					expect(isDisabled).toBe(true);
				});

				it('Expects download data button to be disabled', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var isDisabled = $testDiv.find('.download-data-btn').is(':disabled');
					expect(isDisabled).toBe(true);
				});
			});

			describe('DOM events for processing buttons', function() {
				var expectedBaseUrl = 'http:fakeservice/enddat/service/execute?';
				var isExpectedUrl = function(url) {
					var testUrl = decodeURIComponent(url);
					return (testUrl.search(expectedBaseUrl) !== -1) &&
						(testUrl.search('style=tab') !== -1) &&
						(testUrl.search('DateFormat=Excel') !== -1) &&
						(testUrl.search('TZ=0_GMT') !== -1) &&
						(testUrl.search('timeInt=6') !== -1) &&
						(testUrl.search('fill=NaN') !== -1) &&
						(testUrl.search('endPosition=2006-06-30') !== -1) &&
						(testUrl.search('beginPosition=2001-04-05') !== -1) &&
						(testUrl.search('DatasetId=2:2!Var1') !== -1) &&
						(testUrl.search('DatasetId=3:3:Min:2!Var1') !== -1);
				};

				beforeEach(function() {
					testModel.set({
						outputFileFormat : 'tab',
						outputDateFormat : 'Excel',
						outputTimeZone : '0_GMT',
						outputTimeGapInterval : '6',
						outputMissingValue : 'NaN',
						outputDateRange : {
							start : moment('2001-04-05', Config.DATE_FORMAT),
							end : moment('2006-06-30', Config.DATE_FORMAT)
						}
					});
				});

				it('Expects that there is one url displayed within the URL container', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var urlCount = $testDiv.find('ul.url-links li').length;
					expect(urlCount).toEqual(1);
				});

				it('Expects there is not a warning message', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var message = $testDiv.find('p.warning-msg').html();
					expect(message).toEqual('');
				});

				it('Expects get data button to be enabled', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var isDisabled = $testDiv.find('.get-data-btn').is(':disabled');
					expect(isDisabled).toBe(false);
				});

				it('Expects download data button to be enabled', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var isDisabled = $testDiv.find('.download-data-btn').is(':disabled');
					expect(isDisabled).toBe(false);					
				});

				it('Expects that the expected url is shown in the url container', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					expect(isExpectedUrl($testDiv.find('.url-container ul').html())).toBe(true);
				});

				it('Expects that the expected url is used to open a new window', function() {
					spyOn(window, 'open');
					$testDiv.find('.get-data-btn').trigger('click');
					expect(isExpectedUrl(window.open.calls.argsFor(0)[0])).toBe(true);
				});
			});
		});
	});
});