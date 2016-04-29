/* jslint browser: true */
/* global expect, spyOn */

define([
	'jquery',
	'underscore',
	'backbone',
	'moment',
	'Config',
	'models/WorkflowStateModel',
	'views/VariableSummaryView'
], function($, _, Backbone, moment, Config, WorkflowStateModel, VariableSummaryView) {
	describe('views/VariableSummaryView', function() {
		var testView;
		var $testDiv;
		var testModel;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new WorkflowStateModel();
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
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
					{x : '1', y : '2'}, {x : '2', y : '2'}
				]);
				datasetCollections[Config.NWIS_DATASET].reset([
					{siteId : 'S1', variables : new Backbone.Collection([{name : 'V1'}, {name : 'V2'}])}
				]);

				expect(testView.render).toHaveBeenCalled();
				expect(testView.context.hasSelectedVariables).toBe(false);
				_.each(testView.context.selectedDatasets, function(dataset) {
					expect(dataset.variables.length).toBe(0);
				});
			});
		});

		describe('Tests for model event listener setup if the model does contain datasets at initialization', function() {

			var datasetCollections;
			beforeEach(function() {
				var startDate = moment('2002-04-11', 'YYYY-MM-DD');
				var endDate = moment('2006-11-23', 'YYYY-MM-DD');
				testModel.initializeDatasetCollections();
				datasetCollections = testModel.get('datasetCollections');
				datasetCollections[Config.PRECIP_DATASET].reset([
					{x : '1', y : '2', lat : '43', lon : '-90', startDate : startDate, endDate : endDate},
					{x : '2', y : '3', lat : '44', lon : '-91', startDate : startDate, endDate : endDate}
				]);
				datasetCollections[Config.NWIS_DATASET].reset([
					{siteNo : 'S1', variables : new Backbone.Collection([
							{name : 'V1', startDate : startDate, endDate : endDate},
							{name : 'V2', startDate : startDate, endDate : endDate}])}
				]);

				testView = new VariableSummaryView({
					$el : $testDiv,
					model : testModel
				});
				testView.render();

				spyOn(testView, 'render').and.callThrough();
			});


			it('Expects that if a precip variable is selected the view is rendered with the appropriate context', function() {
				var precipSelected;
				var nwisSelected;
				var precipModelToUpdate = datasetCollections[Config.PRECIP_DATASET].at(1)
				precipModelToUpdate.set('selected', true);
				precipSelected = _.find(testView.context.selectedDatasets, function(d) {
					return d.datasetName === Config.PRECIP_DATASET;
				});
				nwisSelected = _.find(testView.context.selectedDatasets, function(d) {
					return d.datasetName === Config.NWIS_DATASET;
				});

				expect(testView.render).toHaveBeenCalled();
				expect(testView.context.hasSelectedVariables).toBe(true);
				expect(precipSelected.variables.length).toBe(1);
				expect(precipSelected.variables[0]).toEqual({
					modelId : precipModelToUpdate.cid,
					variableId : precipModelToUpdate.cid,
					siteId : '44.000, -91.000',
					startDate : '2002-04-11',
					endDate : '2006-11-23',
					property : '3:2'
				});
				expect(nwisSelected.variables.length).toBe(0);
			});

			it('Expects that if a nwis variable is selected the view is rendered with the appropriate context', function() {
				var precipSelected;
				var nwisSelected;
				var nwisModelToUpdate = datasetCollections[Config.NWIS_DATASET].at(0);
				var nwisVariableToUpdate = nwisModelToUpdate.get('variables').at(1);
				nwisVariableToUpdate.set('selected', true);
				precipSelected = _.find(testView.context.selectedDatasets, function(d) {
					return d.datasetName === Config.PRECIP_DATASET;
				});
				nwisSelected = _.find(testView.context.selectedDatasets, function(d) {
					return d.datasetName === Config.NWIS_DATASET;
				});

				expect(testView.render).toHaveBeenCalled();
				expect(testView.context.hasSelectedVariables).toBe(true);
				expect(precipSelected.variables.length).toBe(0);
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
		});

		describe('Tests for DOM event handlers', function() {
			var datasetCollections;

			beforeEach(function() {
				var startDate = moment('2002-04-11', 'YYYY-MM-DD');
				var endDate = moment('2006-11-23', 'YYYY-MM-DD');
				testModel.initializeDatasetCollections();
				datasetCollections = testModel.get('datasetCollections');
				datasetCollections[Config.PRECIP_DATASET].reset([
					{x : '1', y : '2', lat : '43', lon : '-90', startDate : startDate, endDate : endDate},
					{x : '2', y : '3', lat : '44', lon : '-91', startDate : startDate, endDate : endDate, selected: true}
				]);
				datasetCollections[Config.NWIS_DATASET].reset([
					{siteNo : 'S1', variables : new Backbone.Collection([
							{name : 'V1', startDate : startDate, endDate : endDate, selected : true},
							{name : 'V2', startDate : startDate, endDate : endDate}])}
				]);

				testView = new VariableSummaryView({
					$el : $testDiv,
					model : testModel
				});
				testView.render();
			});

			it('Expects that clicking a variables remove button unselects that variable', function(){
				var selectedPrecipModel = datasetCollections[Config.PRECIP_DATASET].at(1);
				var selectedNWISVariableModel = datasetCollections[Config.NWIS_DATASET].at(0).get('variables').at(0);

				testView.$('button[data-variable-id="' + selectedPrecipModel.cid + '"]').trigger('click');

				expect(selectedPrecipModel.get('selected')).toBe(false);

				testView.$('button[data-variable-id="' + selectedNWISVariableModel.cid + '"]').trigger('click');

				expect(selectedNWISVariableModel.get('selected')).toBe(false);
			});
		});
	});
});