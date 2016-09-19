/* jslint browser: true */
/* global spyOn, expect, jasmine */

define([
	'squire',
	'jquery',
	'underscore',
	'moment',
	'csv',
	'filesaver',
	'Config',
	'bootstrap-datetimepicker',
	'utils/VariableParameter',
	'models/WorkflowStateModel',
	'models/BaseDatasetCollection',
	'models/BaseVariableCollection',
	'views/BaseView'
], function(Squire, $, _, moment, csv, filesaver, Config, datetimepicker, VariableParameter,
	WorkflowStateModel, BaseDatasetCollection, BaseVariableCollection, BaseView) {

	describe('views/ProcessDataView', function() {
		"use strict";
		var testView, ProcessDataView;
		var $testDiv;
		var testModel;
		var maxUrlLength;
		var variableCollectionLong;

		var setElVariableTsOptionView, renderVariableTsOptionView, removeVariableTsOptionView;

		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			spyOn($, 'ajax');

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

				// generates a URL with 186 characters (give or take depending on other parameters
				var variableCollection = new BaseVariableCollection([
					{x : '2', y: '2', selected : true,
						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '2:2', value : '2:2', colName : 'Var1'}),
						timeSeriesOptions : [{statistic : 'raw'}]
					},
					{x : '3', y: '3', selected : true,
						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '3:3', value : '3:3', colName : 'Var1'}),
						timeSeriesOptions : [{statistic : 'Min', timeSpan : '2'}]}
				]);

				// generates a URL with 220+ characters
				variableCollectionLong = new BaseVariableCollection([
 	  				{x : '2', y: '2', selected : true,
 	  					variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '2:2', value : '2:2', colName : 'Var1'}),
 	  					timeSeriesOptions : [{statistic : 'raw'}]
 	  				},
					{x : '2', y: '2', selected : true,
						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '2:2', value : '2:2', colName : 'Var2'}),
						timeSeriesOptions : [{statistic : 'Min', timeSpan : '2'}]},
					{x : '3', y: '3', selected : true,
						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '3:3', value : '3:3', colName : 'Var1'}),
						timeSeriesOptions : [{statistic : 'raw'}]
					},
					{x : '3', y: '3', selected : true,
						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '3:3', value : '3:3', colName : 'Var2'}),
						timeSeriesOptions : [{statistic : 'Min', timeSpan : '2'}]}
 	  			]);

				var siteCollection = new BaseDatasetCollection([
				    {datasetName : 'DatasetId',
				    	siteNo : '2:2',
				    	name : 'Some Site Name 2:2',
				    	lat : '-43.33',
				    	lon : '97.01',
				    	elevation : '17',
				    	elevationUnit : 'm',
				    	variables : new BaseVariableCollection([
        					{x : '2', y: '2', selected : true,
        						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '2:2', value : '2:2', colName : 'Var1'}),
        						timeSeriesOptions : [{statistic : 'raw'}]
        					},
        					{x : '2', y: '2', selected : true,
        						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '2:2', value : '2:2', colName : 'Var2'}),
        						timeSeriesOptions : [{statistic : 'Min', timeSpan : '2'}]}
        				])
				    },
				    {datasetName : 'DatasetId',
				    	siteNo : '3:3',
				    	name : 'Some Site Name 3:3',
				    	lat : '46.79',
				    	lon : '28.11',
				    	elevation : '-89',
				    	elevationUnits : 'm',
				    	variables : new BaseVariableCollection([
        					{x : '3', y: '3', selected : true,
        						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '3:3', value : '3:3', colName : 'Var1'}),
        						timeSeriesOptions : [{statistic : 'raw'}]
        					},
        					{x : '3', y: '3', selected : true,
        						variableParameter : new VariableParameter({name : 'DatasetId', siteNo : '3:3', value : '3:3', colName : 'Var2'}),
        						timeSeriesOptions : [{statistic : 'Min', timeSpan : '2'}]}
        				])
				    }
				]);

				testModel = new WorkflowStateModel({
					step : Config.PROCESS_DATA_STEP,
					outputDateRange : {
						start : moment('2001-02-05', Config.DATE_FORMAT),
						end : moment('2005-04-01', Config.DATE_FORMAT)
					}
				});
				testModel.initializeDatasetCollections();

				spyOn(testModel, 'getSitesWithSelectedVariables').and.returnValue(siteCollection.models);
				spyOn(testModel, 'getSelectedVariables').and.returnValue(variableCollection.models);

				maxUrlLength = 215;

				testView = new ProcessDataView({
					el : $testDiv,
					model : testModel,
					maxUrlLength : maxUrlLength
				});

				done();
			});
		});

		afterEach(function() {
			injector.remove();
			testView.remove();
			$testDiv.remove();
		});

		describe('Tests for render with a long URL', function() {

			beforeEach(function() {
				testModel.getSelectedVariables.and.returnValue(variableCollectionLong.models);
				spyOn(testModel, 'getSelectedVarsDateRange').and.returnValue({
					start : moment('2000-01-04', Config.DATE_FORMAT),
					end : moment('2005-06-01', Config.DATE_FORMAT)
				});
				testModel.set({
					outputFileFormat : 'tab',
					outputDateFormat : 'Excel',
					outputTimeZone : '0_GMT',
					outputTimeGapInterval : '6',
					outputMissingValue : 'NaN'
				});
				testView.render($testDiv.html());
			});

			it('Expects variableTsOptionView to be rendered for each of the variables.', function() {
				expect(renderVariableTsOptionView.calls.count()).toBe(4);
				expect(testView.variableTsOptionViews.length).toBe(4);
			});

			it('Expects the download button is disabled when URL length is greater than 215 characters.', function() {
				var isDisabled = $testDiv.find('.download-data-btn').is(':disabled');
				expect(isDisabled).toBe(true);
			});

			it('Expects the get data button is disabled when URL length is greater than 215 characters.', function() {
				var isDisabled = $testDiv.find('.get-data-btn').is(':disabled');
				expect(isDisabled).toBe(true);
			});

			it('Expects a message explaining the disabled buttons', function() {
				var messageText = ("The get data buttons have been disabled because the URL for the selected variables exceeds "
						+ maxUrlLength +
						" characters.");
				var message = $testDiv.find('#disabled-btn-msg').html();
			    expect(message).toEqual(messageText);
			});
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				spyOn(testModel, 'getSelectedVarsDateRange').and.returnValue({
					start : moment('2000-01-04', Config.DATE_FORMAT),
					end : moment('2005-06-01', Config.DATE_FORMAT)
				});
				testModel.set({
					outputFileFormat : 'tab',
					outputDateFormat : 'Excel',
					outputTimeZone : '0_GMT',
					outputTimeGapInterval : '6',
					outputMissingValue : 'NaN'
				});

				spyOn($.fn, 'fileupload');
				spyOn(testView.alertFilterFileView, 'render').and.callThrough();
				spyOn(testView.alertFilterFileView, 'setElement').and.callThrough();
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

			it('Expects that an alert view\'s setElement is called but the view is not rendered', function() {
				expect(testView.alertFilterFileView.render).not.toHaveBeenCalled();
				expect(testView.alertFilterFileView.setElement).toHaveBeenCalled();
			});

			it('Expects that the file uploader is initialized', function() {
				expect($.fn.fileupload).toHaveBeenCalled();
				expect($.fn.fileupload.calls.first().object.attr('id')).toEqual('time-filter-file-input');
			});

			it('Expects the download button is enabled when the variable URL is less than 215 characters.', function() {
				var isDisabled = $testDiv.find('.download-data-btn').is(':disabled');
				expect(isDisabled).toBe(false);
			});

			it('Expects the get data button is enabled when the variable URL is less than 215 characters.', function() {
				var isDisabled = $testDiv.find('.get-data-btn').is(':disabled');
				expect(isDisabled).toBe(false);
			});

			it('Expects that there is not a message explaining the disabled buttons', function() {
				var messageText = '';
				var message = $testDiv.find('#disabled-btn-msg').html();
			    expect(message).toEqual(messageText);
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

			it('Expects that the alerview will be removed', function() {
				spyOn(testView.alertFilterFileView, 'remove');
				testView.remove();

				expect(testView.alertFilterFileView.remove).toHaveBeenCalled();
			})
		});

		describe('Model event listener tests', function() {
			var datasetCollections;

			beforeEach(function() {
				testModel.initializeDatasetCollections();
				datasetCollections = testModel.get('datasetCollections');
				datasetCollections[Config.PRECIP_DATASET].reset([{variables : variableCollectionLong}]);
				spyOn(testModel, 'getSelectedVarsDateRange').and.returnValue({
					start : moment('2000-01-04', Config.DATE_FORMAT),
					end : moment('2005-06-01', Config.DATE_FORMAT)
				});
				testModel.getSelectedVariables.and.callThrough();
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
					timeFilterId : '01234567',
					outputDateFormat : 'Excel',
					outputTimeZone : '0_GMT',
					outputTimeGapInterval : '6',
					outputMissingValue : 'NaN'
				});
				expect($testDiv.find('#output-date-format-input').val()).toEqual('Excel');
				expect($testDiv.find('#time-filter-id-input').val()).toEqual('01234567');
				expect($testDiv.find('#output-time-zone-input').val()).toEqual('0_GMT');
				expect($testDiv.find('#output-file-format-input').val()).toEqual('tab');
				expect($testDiv.find('#missing-value-input').val()).toEqual('NaN');
				expect($testDiv.find('#acceptable-data-gap-input').val()).toEqual('6');
			});

			it('Expects the get data button is enabled when variables are deselected to shorten URL length.', function() {
				var variableModels;
				var $getDataBtn = $testDiv.find('.get-data-btn');

				expect($getDataBtn.is(':disabled')).toBe(true);

				variableModels = testModel.getSelectedVariables();
				// change the last two variables to selected : false
				_.each(variableModels.splice(2), function(variableModel){
					variableModel.set('selected', false);
				});

				expect($getDataBtn.is(':disabled')).toBe(false);
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

				$('#time-filter-id-input').val('12345').trigger('change');
				expect(testModel.get('timeFilterId')).toEqual('12345');

				$('#output-file-format-input').val('csv').trigger('change');
				expect(testModel.get('outputFileFormat')).toEqual('csv');

				$('#missing-value-input').val('999').trigger('change');
				expect(testModel.get('outputMissingValue')).toEqual('999');

				$('#acceptable-data-gap-input').val('12').trigger('change');
				expect(testModel.get('outputTimeGapInterval')).toEqual('12');
			});

			describe('DOM events for processing buttons with a long URL', function() {

				beforeEach(function() {
					testModel.getSelectedVariables.and.returnValue(variableCollectionLong.models);
					testModel.set({
						outputFileFormat : 'tab',
						outputDateFormat : 'Excel',
						outputTimeZone : '0_GMT',
						outputMissingValue : 'NaN',
						outputDateRange : {
							start : moment('2001-04-05', Config.DATE_FORMAT),
							end : moment('2006-06-30', Config.DATE_FORMAT)
						}
					});
				});

				it('Expects a message be shown for more than one site url', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var expectedMsg = ('The URL for data processing exceeds '
							+ maxUrlLength +
							' characters. A single URL has been provided for each selected station.');
					var message = $testDiv.find('p#url-container-msg').html();
					expect(message).toEqual(expectedMsg);
				});

				it('Expects urls are separated by site', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var firstUrl = decodeURIComponent($testDiv.find('ul.url-links li:nth-child(1)').html());
					var secondUrl = decodeURIComponent($testDiv.find('ul.url-links li:nth-child(2)').html());
					var firstInspect = (firstUrl.search('DatasetId=2:2!Var1') !== -1) && (firstUrl.search('DatasetId=3:3:Min:2!Var1') === -1);
					var secondInspect = (secondUrl.search('DatasetId=2:2!Var1') === -1) && (secondUrl.search('DatasetId=3:3:Min:2!Var2') !== -1);
					expect(firstInspect).toBe(true);
					expect(secondInspect).toBe(true);
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

				it('Expects that if the lake has been set in the GLCFS collection, it will be shown in the url', function() {
					var url;
					testModel.get('datasetCollections')[Config.GLCFS_DATASET].setLake('Erie');
					$testDiv.find('.show-url-btn').trigger('click');
					url = $testDiv.find('ul.url-links li').html();

					expect(url.search('Lake=erie')).not.toEqual(-1);

					testModel.get('datasetCollections')[Config.GLCFS_DATASET].setLake('');
					$testDiv.find('.show-url-btn').trigger('click');
					url = $testDiv.find('ul.url-links li').html();

					expect(url.search('Lake=')).toEqual(-1);
				});

				it('Expects there is not a warning message', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var message = $testDiv.find('#url-container-msg').html();
					expect(message).toEqual('');
				});

				it('Expects there is not a warning message', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					var message = $testDiv.find('p.warning-msg').html();
					expect(message).toEqual('');
				});

				it('Expects that the expected url is shown in the url container', function() {
					$testDiv.find('.show-url-btn').trigger('click');
					expect(isExpectedUrl($testDiv.find('.url-container ul').html())).toBe(true);
				});

				it('Expects that if the timeFilterId is set, the url shown does not contain the beginPosition and endPosition', function() {
					var url;
					testModel.set('timeFilterId', '12345');
					$testDiv.find('.show-url-btn').trigger('click');
					url = $testDiv.find('.url-container ul').html();

					expect(url).toContain('filterId=12345');
					expect(url).toContain('timeInt=6');
					expect(url).not.toContain('beginPosition');
					expect(url).not.toContain('endPosition');
				});

				it('Expects that the expected url is used to open a new window', function() {
					spyOn(window, 'open');
					$testDiv.find('.get-data-btn').trigger('click');
					expect(isExpectedUrl(window.open.calls.argsFor(0)[0])).toBe(true);
				});

				it('Expects that saveAs is called when download metadata is clicked', function() {
					spyOn(window, 'saveAs');
					$testDiv.find('.download-site-metadata').trigger('click');
					expect(window.saveAs).toHaveBeenCalled();
				});
			});
		});
	});
});
