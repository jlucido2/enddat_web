/* jslint browser: true */
/* global jasmine, expect, sinon */

define([
	'jquery',
	'select2',
	'moment',
	'models/WorkflowStateModel',
	'views/ChooseView'
], function($, select2, moment, WorkflowStateModel, ChooseView) {
	"use strict";

	fdescribe('views/ChooseView', function() {
		var testView;
		var testModel;
		var $testDiv;
		var fakeServer;

		var DATE_FORMAT = 'YYYY-MM-DD';

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new WorkflowStateModel();
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
			it('Expects a collapsible panel to be rendered', function() {
				testView.render();
				var $panel = $testDiv.find('.collapsible-panel');
				expect($panel.length).toBe(1);
				expect($panel.find('.panel-heading').html()).toContain('Choose Data');
			});

			it('Expects the inputs to reflect the values in the model', function() {
				testModel.set({
					radius : '2',
					startDate : moment('2001-01-01', DATE_FORMAT),
					endDate : moment('2010-01-01', DATE_FORMAT),
					datasets : [testModel.NWIS_DATASET]
				});
				testView.render();
				expect($testDiv.find('#radius').val()).toEqual('2');
				expect($testDiv.find('#start-date').val()).toEqual('2001-01-01');
				expect($testDiv.find('#end-date').val()).toEqual('2010-01-01');
				expect($testDiv.find('#datasets-select').val()).toEqual([testModel.NWIS_DATASET]);
			});
		});

		describe('DOM event handler tests', function() {
			var $rad, $datasets, $startDate, $endDate;
			beforeEach(function() {
				testView.render();
				$rad = $testDiv.find('#radius');
				$datasets = $testDiv.find('#datasets-select');
				$startDate = $testDiv.find('#start-date');
				$endDate = $testDiv.find('#end-date');

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

			it('Expects that changing the start date updates the model\'s startDate property', function() {
				$startDate.val('2002-02-15').trigger('change');
				expect(testModel.get('startDate').format(DATE_FORMAT)).toEqual('2002-02-15');
			});

			it('Expects that changing the end date updates the model\'s endDate property', function() {
				$endDate.val('2002-02-15').trigger('change');
				expect(testModel.get('endDate').format(DATE_FORMAT)).toEqual('2002-02-15');
			});
		});

		describe('Model event handlers', function() {
			var $rad, $datasets, $startDate, $endDate;
			beforeEach(function() {
				testView.render();
				$rad = $testDiv.find('#radius');
				$datasets = $testDiv.find('#datasets-select');
				$startDate = $testDiv.find('#start-date');
				$endDate = $testDiv.find('#end-date');
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

			it('Expects that when the model\'s startDate property is updated, the start date field is updated', function() {
				testModel.set('startDate', moment('2004-04-01', DATE_FORMAT));
				expect($startDate.val()).toEqual('2004-04-01');

				testModel.set('startDate', '');
				expect($startDate.val()).toEqual('');
			});

			it('Expects that when the model\'s endDate property is updated, the end date field is updated', function() {
				testModel.set('endDate', moment('2004-04-01', DATE_FORMAT));
				expect($endDate.val()).toEqual('2004-04-01');

				testModel.set('endDate', '');
				expect($endDate.val()).toEqual('');
			});
		});
	});
});