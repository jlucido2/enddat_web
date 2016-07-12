/* jslint browser: true */
/* global jasmine, expect, sinon */

define([
	'squire',
	'jquery',
	'select2',
	'backbone',
	'Config',
	'views/BaseView',
], function(Squire, $, select2, Backbone, Config, BaseView) {
	"use strict";

	describe('views/ChooseView', function() {
		var ChooseView;
		var testView;
		var testModel;
		var $testDiv;

		var setElDateViewSpy, renderDateViewSpy, removeDateViewSpy;

		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			setElDateViewSpy = jasmine.createSpy('setElDateViewSpy');
			renderDateViewSpy = jasmine.createSpy('renderDateViewSpy');
			removeDateViewSpy = jasmine.createSpy('removeDateViewSpy');

			testModel = new Backbone.Model();

			injector = new Squire();
			injector.mock('views/DataDateFilterView', BaseView.extend({
				setElement : setElDateViewSpy.and.returnValue({
					render : renderDateViewSpy
				}),
				render : renderDateViewSpy,
				remove : removeDateViewSpy
			}));

			injector.require(['views/ChooseView'], function(View) {
				ChooseView = View;

				testView = new ChooseView({
					el : $testDiv,
					model : testModel
				});

				done();
			});
		});

		afterEach(function() {
			injector.remove();
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		it('Expects that the DataDateFilterView is initialized', function() {
			expect(setElDateViewSpy).toHaveBeenCalled();
		});

		describe('Tests for remove', function() {
			beforeEach(function() {
				testView.render();
			});
			it('Expects the DataDateFilterView to be removed', function(){
				testView.remove();

				expect(removeDateViewSpy).toHaveBeenCalled();
			});
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
					datasets : [Config.NWIS_DATASET]
				});
				testView.render();

				expect($testDiv.find('#datasets-select').val()).toEqual([Config.NWIS_DATASET]);
			});

			it('Expects the DataDateFilter to be rendered', function() {
				setElDateViewSpy.calls.reset();
				testView.render();

				expect(setElDateViewSpy).toHaveBeenCalled();
				expect(renderDateViewSpy).toHaveBeenCalled();
			});
		});

		describe('DOM event handler tests', function() {
			var $datasets;
			beforeEach(function() {
				testView.render();
				$datasets = $testDiv.find('#datasets-select');
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
			var $datasets;
			beforeEach(function() {
				testView.render();
				$datasets = $testDiv.find('#datasets-select');
			});

			it('Expects that if the model\'s datasets property is updated the datasets field is updated', function() {
				testModel.set('datasetCollections', {'NWIS': {}});
				testModel.set('datasets', ['NWIS']);
				expect($datasets.val()).toEqual(['NWIS']);
			});
		});
	});
});