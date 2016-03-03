/* jslint browser: true */
/* global jasmine, expect */

define([
	'squire',
	'jquery',
	'models/WorkflowStateModel',
	'views/BaseView'
], function(Squire, $, WorkflowStateModel, BaseView) {
	"use strict";

	xdescribe("DataDiscoveryView", function() {

		var DataDiscoveryView;
		var testView;
		var testModel;
		var $testDiv;

		var initializeBaseViewSpy, renderBaseViewSpy, removeBaseViewSpy;
		var setElNavViewSpy, renderNavViewSpy, removeNavViewSpy;
		var setElMapViewSpy, renderMapViewSpy, removeMapViewSpy;

		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			initializeBaseViewSpy = jasmine.createSpy('initializeBaseViewSpy');
			renderBaseViewSpy = jasmine.createSpy('renderBaseViewSpy');
			removeBaseViewSpy = jasmine.createSpy('removeBaseViewSpy');

			setElNavViewSpy = jasmine.createSpy('setElNavViewSpy');
			renderNavViewSpy = jasmine.createSpy('renderNavViewSpy');
			removeNavViewSpy = jasmine.createSpy('removeNavViewSpy');

			setElMapViewSpy = jasmine.createSpy('setElMapViewSpy');
			renderMapViewSpy = jasmine.createSpy('renderMapViewSpy');
			removeMapViewSpy = jasmine.createSpy('removeMapViewSpy');

			testModel = new WorkflowStateModel();
			testModel.set('step', testModel.PROJ_LOC_STEP);

			injector = new Squire();
			injector.mock('views/BaseView', BaseView.extend({
				initialize : initializeBaseViewSpy,
				render : renderBaseViewSpy,
				remove : removeBaseViewSpy
			}));
			injector.mock('views/NavView', BaseView.extend({
				setElement : setElNavViewSpy.and.returnValue({
					render : renderNavViewSpy
				}),
				render : renderNavViewSpy,
				remove : removeNavViewSpy
			}));
			injector.mock('views/MapView', BaseView.extend({
				setElement : setElMapViewSpy.and.returnValue({
					render : renderMapViewSpy
				}),
				render : renderMapViewSpy,
				remove : removeMapViewSpy
			}));
			injector.require(['views/DataDiscoveryView'], function(view) {
				DataDiscoveryView = view;
				done();
			});
		});

		afterEach(function() {
			injector.remove();
			if (testView.remove) {
				testView.remove();
			}
			$testDiv.remove();
		});

		it('Expects that BaseView.initialize is called', function() {
			testView = new DataDiscoveryView({
				el : $testDiv,
				model : testModel
			});
			expect(initializeBaseViewSpy).toHaveBeenCalled();
		});

		it('Expects the child views to be initialized', function() {
			testView = new DataDiscoveryView({
				el : $testDiv,
				model : testModel
			});

			expect(setElNavViewSpy.calls.count()).toBe(1);
			expect(setElMapViewSpy.calls.count()).toBe(1);
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView = new DataDiscoveryView({
					el : $testDiv,
					model : testModel
				});
			});

			it('Expects that the BaseView render is called', function() {
				testView.render();
				expect(renderBaseViewSpy).toHaveBeenCalled();
			});

			it('Expects that the navView is rendered regardless of workflow step', function() {
				testView.render();
				expect(setElNavViewSpy.calls.count()).toBe(2);
				expect(renderNavViewSpy.calls.count()).toBe(1);

				testModel.set('step', testModel.CHOOSE_DATA_STEP);
				testView.render();
				expect(setElNavViewSpy.calls.count()).toBe(3);
				expect(renderNavViewSpy.calls.count()).toBe(2);

				testModel.set('step', testModel.PROCESS_DATA_STEP);
				testView.render();
				expect(setElNavViewSpy.calls.count()).toBe(4);
				expect(renderNavViewSpy.calls.count()).toBe(3);
			});

			it('Expects that the mapView is rendered only if the workflow step is specify project location or choose data', function() {
				testView.render();
				expect(setElMapViewSpy.calls.count()).toBe(2);
				expect(renderMapViewSpy.calls.count()).toBe(1);

				testModel.set('step', testModel.CHOOSE_DATA_STEP);
				testView.render();
				expect(setElMapViewSpy.calls.count()).toBe(3);
				expect(renderMapViewSpy.calls.count()).toBe(2);

				testModel.set('step', testModel.PROCESS_DATA_STEP);
				testView.render();
				expect(setElMapViewSpy.calls.count()).toBe(3);
				expect(renderMapViewSpy.calls.count()).toBe(2);
			});
		});

		describe('Tests for remove', function() {
			beforeEach(function() {
				testView = new DataDiscoveryView({
					el : $testDiv,
					model : testModel
				});
				testView.remove();
			});

			it('Expects that the BaseView remove is called', function() {
				expect(removeBaseViewSpy).toHaveBeenCalled();
			});

			it('Expects that the children views are removed', function() {
				expect(removeNavViewSpy.calls.count()).toBe(1);
				expect(removeMapViewSpy.calls.count()).toBe(1);
			});
		});
	});
});