/* jslint browser: true */
/* global jasmine, expect, spyOn */

define([
	'squire',
	'jquery',
	'select2',
	'bootstrap',
	'backbone',
	'Config',
	'models/GLCFSCollection',
	'views/BaseView'
], function(Squire, $, select2, bootstrap, Backbone, Config, GLCFSCollection, BaseView) {
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
			injector.mock('jquery', $);
			injector.mock('views/DataDateFilterView', BaseView.extend({
				setElement : setElDateViewSpy.and.returnValue({
					render : renderDateViewSpy
				}),
				render : renderDateViewSpy,
				remove : removeDateViewSpy
			}));


			injector.require(['views/ChooseView'], function(View) {
				ChooseView = View;
				spyOn($.fn, 'modal').and.callThrough();
				spyOn($.fn, 'select2').and.callThrough();

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

			it('Expects that the dataset select has been initialized with select2', function() {
				testView.render();
				expect($.fn.select2.calls.mostRecent().object.attr('id')).toEqual('datasets-select');
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

			it('Expects that a modal dialog is initialized', function() {
				testView.render();
				expect($.fn.modal.calls.mostRecent().object.hasClass('glcfs-lake-select-modal')).toBe(true);
			});
		});

		describe('DOM event handler tests', function() {
			var $datasets;
			var glcfsCollection;
			beforeEach(function() {
				glcfsCollection = new GLCFSCollection();

				testModel.set('datasets', []);
				testModel.set('datasetCollections', {
					'GLCFS' : glcfsCollection
				});
				testModel.get('dataset');
				testView.render();
				$datasets = $testDiv.find('#datasets-select');
			});

			// Have to call the select2 event handlers directly
			it('Expects that changing the datasets updates the model\'s datasets property', function() {
				var ev = {
					params : {
						args : {
							data : {id : 'NWIS'}
						}
					}
				};
				testView.selectDataset(ev);
				expect(testModel.get('datasets')).toEqual([Config.NWIS_DATASET]);

				ev = {
					params : {
						data : {id : 'NWIS'}
					}
				};
				testView.resetDataset(ev);
				expect(testModel.get('datasets')).toEqual([]);
			});

			it('Expects that if GLCFS dataset is selected, the modal is shown and the workflow state model is not updated', function() {
				var ev = {
					params : {
						args : {
							data : {id : Config.GLCFS_DATASET}
						}
					},
					preventDefault : jasmine.createSpy('preventDefaultSpy')
				};
				$.fn.modal.calls.reset();
				testView.selectDataset(ev);

				expect($.fn.modal.calls.count()).toBe(1);
				expect($.fn.modal.calls.mostRecent().args).toEqual(['show']);
				expect(testModel.get('datasets')).toEqual([]);
			});

			it('Expects that when a lake is selected in the modal, the GLCFS dataset collection has the lake set', function() {
				$.fn.modal.calls.reset();
				$testDiv.find('.glcfs-lake-select-modal select').val('Erie').trigger('change');
				expect(glcfsCollection.getLake()).toEqual('Erie');
				expect($.fn.modal).toHaveBeenCalledWith('hide');
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