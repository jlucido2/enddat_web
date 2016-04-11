/* jslint browser: true */
/* global jasmine, expect, sinon */

define([
	'jquery',
	'select2',
	'models/WorkflowStateModel',
	'views/ChooseView'
], function($, select2, WorkflowStateModel, ChooseView) {
	"use strict";

	describe('views/ChooseView', function() {
		var testView;
		var testModel;
		var $testDiv;
		var fakeServer;

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new WorkflowStateModel({}, {
				createDatasetModels : true
			});
			testModel.set('step', testModel.PROJ_LOC_STEP);

			testView = new ChooseView({
				el : $testDiv,
				model : testModel
			});
		});

		afterEach(function() {
			fakeServer.restore();
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects a collapsible panel to be rendered', function() {
				var $panel = $testDiv.find('.collapsible-panel');
				expect($panel.length).toBe(1);
				expect($panel.find('.panel-heading').html()).toContain('Choose Data');
			});
		});

		describe('DOM event handler tests', function() {
			var $rad, $datasets;
			beforeEach(function() {
				testView.render();
				$rad = $testDiv.find('#radius');
				$datasets = $testDiv.find('#datasets-select');

			});

			it('Expects that changing the radius updates the model\'s radius property', function() {
				$rad.val('5').trigger('change');
				expect(testModel.get('radius')).toEqual('5');
			});

			// Have to call the select2 event handlers directly
			it('Expects that changing the datasets updates the model\'s datasets property', function() {
				var ev = {
					params : {
						data : {id : 'NWIS'}
					}
				};
				testView.selectDataset(ev);
				expect(testModel.get('datasets')).toEqual(['NWIS']);

				testView.resetDataset(ev);
				expect(testModel.get('datasets')).toEqual([]);
			});
		});

		describe('Model event handlers', function() {
			var $rad, $datasets;
			beforeEach(function() {
				testView.render();
				$rad = $testDiv.find('#radius');
				$datasets = $testDiv.find('#datasets-select');
			});

			it('Expects that if the model\'s radius property is updated the radius field is updated', function() {
				testModel.set('radius', '5');
				expect($rad.val()).toEqual('5');
			});

			it('Expects that if the model\'s datasets property is updated the datasets field is updated', function() {
				testModel.set('datasetCollections', {'NWIS': {}});
				testModel.set('datasets', ['NWIS']);
				expect($datasets.val()).toEqual(['NWIS']);
			});
		});
	});
});