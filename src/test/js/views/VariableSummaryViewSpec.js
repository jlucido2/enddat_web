/* jslint browser: true */
/* global expect, spyOn, sinon */

define([
	'jquery',
	'underscore',
	'moment',
	'Config',
	'models/WorkflowStateModel',
	'models/BaseVariableCollection',
	'views/VariableSummaryView'
], function($, _, moment, Config, WorkflowStateModel, BaseVariableCollection, VariableSummaryView) {
	"use strict";

	describe('views/VariableSummaryView', function() {
		var testView;
		var $testDiv;
		var testModel;
		var fakeServer;

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new WorkflowStateModel();
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
			fakeServer.restore();
		});

		describe('Tests for model event listener setup if  the model does not contain any datasets at initialization', function() {
			beforeEach(function() {
				testView = new VariableSummaryView({
					$el : $testDiv,
					model : testModel
				});
				testView.render();

				spyOn(testView, 'render').and.callThrough();
			});

			it('Expects that when the view is rendered, the context has empty selected datasets', function() {

				expect(testView.context.hasSelectedVariables).toBe(false);
				_.each(testView.context.selectedDatasets, function(dataset) {
					expect(dataset.variables.length).toBe(0);
				});
			});

			it('Expects that if datasets are added to the workflow model after render, render is called with the expected context', function() {
				testModel.initializeDatasetCollections();

				expect(testView.render).toHaveBeenCalled();
				expect(testView.context.hasSelectedVariables).toBe(false);
				_.each(testView.context.selectedDatasets, function(dataset) {
					expect(dataset.variables.length).toBe(0);
				});
			});

			it('Expects that if data is added to the dataset collections, render is called again', function() {
				var datasetCollections;
				testModel.initializeDatasetCollections();
				datasetCollections = testModel.get('datasetCollections');
				testView.render.calls.reset();
				datasetCollections[Config.PRECIP_DATASET].reset([
					{variables : new BaseVariableCollection([{x : '1', y : '2'}])},
					{variables : new BaseVariableCollection([{x : '2', y : '2'}])}
				]);
				datasetCollections[Config.NWIS_DATASET].reset([
					{siteId : 'S1', variables : new BaseVariableCollection([{name : 'V1'}, {name : 'V2'}])}
				]);

				expect(testView.render).toHaveBeenCalled();
				expect(testView.context.hasSelectedVariables).toBe(false);
				_.each(testView.context.selectedDatasets, function(dataset) {
					expect(dataset.variables.length).toBe(0);
				});
			});
		});

		fdescribe('Tests for model event listener setup if the model does contain datasets at initialization', function() {

			var datasetCollections;

			var isPrecip = function(selectedDataset) {
				return selectedDataset.datasetName === Config.PRECIP_DATASET;
			};
			var isNWIS = function(selectedDataset) {
				return selectedDataset.datasetName === Config.NWIS_DATASET;
			};
			var isACIS = function(selectedDataset) {
				return selectedDataset.datasetName === Config.ACIS_DATASET;
			};
			var isGLCFS = function(selectedDataset) {
				return selectedDataset.datasetName === Config.GLCFS_DATASET_ERIE;
			};

			beforeEach(function() {
				var startDate = moment('2002-04-11', 'YYYY-MM-DD');
				var endDate = moment('2006-11-23', 'YYYY-MM-DD');
				testModel.initializeDatasetCollections();
				datasetCollections = testModel.get('datasetCollections');
				datasetCollections[Config.PRECIP_DATASET].reset([
					{lat : '43', lon : '-90', variables : new BaseVariableCollection([{x : '1', y : '2', startDate : startDate, endDate : endDate}])},
					{lat : '44', lon : '-91', variables : new BaseVariableCollection([{x : '2', y : '3', startDate : startDate, endDate : endDate}])}
				]);
				datasetCollections[Config.NWIS_DATASET].reset([
					{siteNo : 'S1', variables : new BaseVariableCollection([
						{name : 'V1', startDate : startDate, endDate : endDate},
						{name : 'V2', startDate : startDate, endDate : endDate}])}
				]);
				datasetCollections[Config.ACIS_DATASET].reset([
					{name : 'ACIS Dataset 1', sid : 'SID1', variables : new BaseVariableCollection([
						{startDate : startDate, endDate : endDate, description : 'ACIS Variable 1'}
					])}
				]);
				datasetCollections[Config.GLCFS_DATASET_ERIE].reset([
					{name : 'GLCFS Dataset 1', sid : 'SID1', variables : new BaseVariableCollection([
						{lat : '43', lon : '-90', variables : new BaseVariableCollection([{x : '1', y : '2', startDate : startDate, endDate : endDate}])},
					])}
				]);

				testView = new VariableSummaryView({
					$el : $testDiv,
					model : testModel
				});
				testView.render();

				spyOn(testView, 'render').and.callThrough();
			});

//			it('Expects that if a glcfs variable is selected the view is rendered with the appropriate context', function() {
//				var glcfsSelected, precipSelected, nwisSelected, acisSelected;
//				var glcfsModelToUpdate = datasetCollections[Config.GLCFS_DATASET_ERIE].at(0);
//				var glcfsVariableToUpdate = glcfsModelToUpdate.get('variables').at(0);
//
//				glcfsVariableToUpdate.set('selected', true);
//				glcfsSelected = _.find(testView.context.selectedDatasets, isGLCFS);
//				precipSelected = _.find(testView.context.selectedDatasets, isPrecip);
//				nwisSelected = _.find(testView.context.selectedDatasets, isNWIS);
//				acisSelected = _.find(testView.context.selectedDatasets, isACIS);
//
//				expect(testView.render).toHaveBeenCalled();
//				expect(testView.context.hasSelectedVariables).toBe(true);
//				expect(glcfsSelected.variables.length).toBe(1);
//				expect(glcfsSelected.variables[0]).toEqual({
//					modelId : glcfsModelToUpdate.cid,
//					variableId : glcfsVariableToUpdate.cid,
//					siteId : '44.000, -91.000',
//					startDate : '2002-04-11',
//					endDate : '2006-11-23',
//					property : '3:2'
//				});
//				expect(nwisSelected.variables.length).toBe(0);
//				expect(acisSelected.variables.length).toBe(0);
//				expect(precipSelected.variables.length).toBe(0);
//			});

			it('Expects that if a precip variable is selected the view is rendered with the appropriate context', function() {
				var precipSelected, nwisSelected, acisSelected;
				var precipModelToUpdate = datasetCollections[Config.PRECIP_DATASET].at(1);
				var precipVariableToUpdate = precipModelToUpdate.get('variables').at(0);

				precipVariableToUpdate.set('selected', true);
				precipSelected = _.find(testView.context.selectedDatasets, isPrecip);
				nwisSelected = _.find(testView.context.selectedDatasets, isNWIS);
				acisSelected = _.find(testView.context.selectedDatasets, isACIS);

				expect(testView.render).toHaveBeenCalled();
				expect(testView.context.hasSelectedVariables).toBe(true);
				expect(precipSelected.variables.length).toBe(1);
				expect(precipSelected.variables[0]).toEqual({
					modelId : precipModelToUpdate.cid,
					variableId : precipVariableToUpdate.cid,
					siteId : '44.000, -91.000',
					startDate : '2002-04-11',
					endDate : '2006-11-23',
					property : '3:2'
				});
				expect(nwisSelected.variables.length).toBe(0);
				expect(acisSelected.variables.length).toBe(0);
			});

			it('Expects that if a nwis variable is selected the view is rendered with the appropriate context', function() {
				var precipSelected, nwisSelected, acisSelected;
				var nwisModelToUpdate = datasetCollections[Config.NWIS_DATASET].at(0);
				var nwisVariableToUpdate = nwisModelToUpdate.get('variables').at(1);
				nwisVariableToUpdate.set('selected', true);
				precipSelected = _.find(testView.context.selectedDatasets, isPrecip);
				nwisSelected = _.find(testView.context.selectedDatasets, isNWIS);
				acisSelected = _.find(testView.context.selectedDatasets, isACIS);

				expect(testView.render).toHaveBeenCalled();
				expect(testView.context.hasSelectedVariables).toBe(true);
				expect(precipSelected.variables.length).toBe(0);
				expect(acisSelected.variables.length).toBe(0);
				expect(nwisSelected.variables.length).toBe(1);
				expect(nwisSelected.variables[0]).toEqual({
					modelId : nwisModelToUpdate.cid,
					variableId : nwisVariableToUpdate.cid,
					siteId : 'S1',
					startDate : '2002-04-11',
					endDate : '2006-11-23',
					property : 'V2'
				});
			});

			it('Expects that if a acis variable is selected the view is rendered with the appropriate context', function() {
				var precipSelected, nwisSelected, acisSelected;
				var acisModelToUpdate = datasetCollections[Config.ACIS_DATASET].at(0);
				var acisVariableToUpdate = acisModelToUpdate.get('variables').at(0);

				acisVariableToUpdate.set('selected', true);
				precipSelected = _.find(testView.context.selectedDatasets, isPrecip);
				nwisSelected = _.find(testView.context.selectedDatasets, isNWIS);
				acisSelected = _.find(testView.context.selectedDatasets, isACIS);

				expect(testView.render).toHaveBeenCalled();
				expect(testView.context.hasSelectedVariables).toBe(true);
				expect(precipSelected.variables.length).toBe(0);
				expect(nwisSelected.variables.length).toBe(0);
				expect(acisSelected.variables.length).toBe(1);
				expect(acisSelected.variables[0]).toEqual({
					modelId : acisModelToUpdate.cid,
					variableId : acisVariableToUpdate.cid,
					siteId : 'SID1',
					startDate : '2002-04-11',
					endDate : '2006-11-23',
					property : 'ACIS Variable 1'
				});
			});
		});

		describe('Tests for DOM event handlers', function() {
			var datasetCollections;

			beforeEach(function() {
				var startDate = moment('2002-04-11', 'YYYY-MM-DD');
				var endDate = moment('2006-11-23', 'YYYY-MM-DD');
				testModel.initializeDatasetCollections();
				datasetCollections = testModel.get('datasetCollections');
				datasetCollections[Config.PRECIP_DATASET].reset([
					{lat : '43', lon : '-90', variables : new BaseVariableCollection([{x : '1', y : '2', startDate : startDate, endDate : endDate}])},
					{lat : '44', lon : '-91', variables : new BaseVariableCollection([{x : '2', y : '3', startDate : startDate, endDate : endDate, selected: true}])}
				]);
				datasetCollections[Config.NWIS_DATASET].reset([
					{siteNo : 'S1', variables : new BaseVariableCollection([
							{name : 'V1', startDate : startDate, endDate : endDate, selected : true},
							{name : 'V2', startDate : startDate, endDate : endDate}])}
				]);
				datasetCollections[Config.ACIS_DATASET].reset([
					{name : 'ACIS Dataset 1', variables : new BaseVariableCollection([
							{selected : true, startDate : startDate, endDate : endDate, description : 'ACIS Variable 1'}
					])}
				]);

				testView = new VariableSummaryView({
					$el : $testDiv,
					model : testModel
				});
				testView.render();
			});

			it('Expects that clicking a variables remove button unselects that variable', function(){
				var selectedPrecipVariableModel = datasetCollections[Config.PRECIP_DATASET].at(1).get('variables').at(0);
				var selectedNWISVariableModel = datasetCollections[Config.NWIS_DATASET].at(0).get('variables').at(0);
				var selectedACISVariableModel = datasetCollections[Config.ACIS_DATASET].at(0).get('variables').at(0);

				testView.$('button[data-variable-id="' + selectedPrecipVariableModel.cid + '"]').trigger('click');

				expect(selectedPrecipVariableModel.get('selected')).toBe(false);

				testView.$('button[data-variable-id="' + selectedNWISVariableModel.cid + '"]').trigger('click');

				expect(selectedNWISVariableModel.get('selected')).toBe(false);

				testView.$('button[data-variable-id="' + selectedACISVariableModel.cid + '"]').trigger('click');

				expect(selectedACISVariableModel.get('selected')).toBe(false);
			});
		});
	});
});