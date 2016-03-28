/* jslint browser: true */
/* global jasmine, expect, sinon */

define([
	'squire',
	'jquery',
	'models/WorkflowStateModel',
	'models/SiteModel',
	'views/BaseView'
], function(Squire, $, WorkflowStateModel, SiteModel, BaseView) {
	"use strict";

	describe("DataDiscoveryView", function() {

		var DataDiscoveryView;
		var testView;
		var testModel;
		var $testDiv;

		var testSiteModel;
		var opDeferred;
		var ajaxStub;

		var initializeBaseViewSpy, renderBaseViewSpy, removeBaseViewSpy;
		var setElNavViewSpy, renderNavViewSpy, removeNavViewSpy;
		var setElMapViewSpy, renderMapViewSpy, removeMapViewSpy;
		var setElLocationViewSpy, renderLocationViewSpy, removeLocationViewSpy;
		var setElChooseViewSpy, renderChooseViewSpy, removeChooseViewSpy;

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

			setElLocationViewSpy = jasmine.createSpy('setElLocationViewSpy');
			renderLocationViewSpy = jasmine.createSpy('renderLocationViewSpy');
			removeLocationViewSpy = jasmine.createSpy('removeLocationViewSpy');

			setElChooseViewSpy = jasmine.createSpy('setElChooseViewSpy');
			renderChooseViewSpy = jasmine.createSpy('renderChooseViewSpy');
			removeChooseViewSpy = jasmine.createSpy('removeChooseViewSpy');

			testModel = new WorkflowStateModel();
			testModel.set('step', testModel.PROJ_LOC_STEP);			

			opDeferred = $.Deferred();
			ajaxStub = sinon.stub($, "ajax");
			testSiteModel = new SiteModel();
			spyOn(testSiteModel, 'fetch').and.returnValue(opDeferred.promise());

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
			injector.mock('views/LocationView', BaseView.extend({
				setElement : setElLocationViewSpy.and.returnValue({
					render : renderLocationViewSpy
				}),
				render : renderLocationViewSpy,
				remove : removeLocationViewSpy
			}));
			injector.mock('views/ChooseView', BaseView.extend({
				setElement : setElChooseViewSpy.and.returnValue({
					render : renderChooseViewSpy
				}),
				render : renderChooseViewSpy,
				remove : removeChooseViewSpy
			}));
			injector.require(['views/DataDiscoveryView'], function(view) {
				DataDiscoveryView = view;
				done();
			});
		});

		afterEach(function() {
			$.ajax.restore();
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
			expect(setElLocationViewSpy.calls.count()).toBe(1);
			expect(setElChooseViewSpy.calls.count()).toBe(1);
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView = new DataDiscoveryView({
					el : $testDiv,
					model : testModel,
					siteModel : testSiteModel
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

			it('Expects that the locationView is rendered only if the workflow step is specify project location or choose data', function() {
				testView.render();
				expect(setElLocationViewSpy.calls.count()).toBe(2);
				expect(renderLocationViewSpy.calls.count()).toBe(1);

				testModel.set('step', testModel.CHOOSE_DATA_STEP);
				testView.render();
				expect(setElLocationViewSpy.calls.count()).toBe(3);
				expect(renderLocationViewSpy.calls.count()).toBe(2);

				testModel.set('step', testModel.PROCESS_DATA_STEP);
				testView.render();
				expect(setElLocationViewSpy.calls.count()).toBe(3);
				expect(renderLocationViewSpy.calls.count()).toBe(2);
			});

			it('Expects that the chooseView is rendered only if the workflow step is choose data', function() {
				testView.render();
				expect(setElChooseViewSpy.calls.count()).toBe(1);
				expect(renderChooseViewSpy.calls.count()).toBe(0);

				testModel.set('step', testModel.CHOOSE_DATA_STEP);
				testView.render();
				expect(setElChooseViewSpy.calls.count()).toBe(3);
				expect(renderChooseViewSpy.calls.count()).toBe(2);

				testModel.set('step', testModel.PROCESS_DATA_STEP);
				testView.render();
				expect(setElChooseViewSpy.calls.count()).toBe(3);
				expect(renderChooseViewSpy.calls.count()).toBe(2);
			});

			it('Expects that when rendering a view without location, radius and dataset, the site model fetch is not called', function() {
				testView.render();
				expect(testSiteModel.fetch).not.toHaveBeenCalled();
			});

			it('Expects that when rendering a view with location, radius and dataset, the site model fetch is called', function() {
				testModel.set('step', testModel.CHOOSE_DATA_STEP);
				testModel.set('radius', 5);
				testModel.set('location', {latitude : 43.0, longitude : -100.0});
				testModel.set('datasets', ['NWIS']);		
				testView.render();
				expect(testSiteModel.fetch).toHaveBeenCalled();
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
				expect(removeLocationViewSpy.calls.count()).toBe(1);
				expect(removeChooseViewSpy.calls.count()).toBe(1);
			});
		});
	});
});