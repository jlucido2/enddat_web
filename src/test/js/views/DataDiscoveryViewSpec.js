/* jslint browser: true */
/* global jasmine, spyOn, expect, sinon */

define([
	'squire',
	'jquery',
	'models/WorkflowStateModel',
	'views/BaseView'
], function(Squire, $, WorkflowStateModel, BaseView) {
	"use strict";

	describe("DataDiscoveryView", function() {

		var DataDiscoveryView;
		var testView;
		var testModel;
		var $testDiv;

		var initializeBaseViewSpy, renderBaseViewSpy, removeBaseViewSpy;
		var setElNavViewSpy, renderNavViewSpy, removeNavViewSpy;
		var setElMapViewSpy, renderMapViewSpy, removeMapViewSpy;
		var setElLocationViewSpy, renderLocationViewSpy, removeLocationViewSpy;
		var setElAlertViewSpy, renderAlertViewSpy, removeAlertViewSpy, showSuccessAlertSpy, showDangerAlertSpy;

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

			setElAlertViewSpy = jasmine.createSpy('setElAlertViewSpy');
			renderAlertViewSpy = jasmine.createSpy('renderAlertViewSpy');
			removeAlertViewSpy = jasmine.createSpy('removeAlertViewSpy');
			showSuccessAlertSpy = jasmine.createSpy('showSuccessAlertSpy');
			showDangerAlertSpy = jasmine.createSpy('showDangerAlertSpy');

			injector = new Squire();

			injector.mock('views/BaseView', BaseView);
			spyOn(BaseView.prototype, 'initialize').and.callThrough();
			spyOn(BaseView.prototype, 'render').and.callThrough();
			spyOn(BaseView.prototype, 'remove').and.callThrough();

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
			injector.mock('views/AlertView', BaseView.extend({
				setElement : setElAlertViewSpy,
				render : renderAlertViewSpy,
				showSuccessAlert : showSuccessAlertSpy,
				showDangerAlert : showDangerAlertSpy,
				remove : removeAlertViewSpy
			}));
			injector.require(['views/DataDiscoveryView'], function(view) {
				DataDiscoveryView = view;

				testModel = new WorkflowStateModel();
				spyOn(testModel, 'updateDatasetModels');
				testModel.set('step', testModel.PROJ_LOC_STEP);

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
			expect(BaseView.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects the child views to be initialized', function() {
			testView = new DataDiscoveryView({
				el : $testDiv,
				model : testModel
			});

			expect(setElNavViewSpy.calls.count()).toBe(1);
			expect(setElMapViewSpy.calls.count()).toBe(1);
			expect(setElLocationViewSpy.calls.count()).toBe(1);
			expect(setElAlertViewSpy.calls.count()).toBe(1);
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
				expect(BaseView.prototype.render).toHaveBeenCalled();
			});

			it('Expects that the dataset models in the workflow model are initially fetched', function() {
				testView.render();
				expect(testModel.updateDatasetModels).toHaveBeenCalled();
			});

			it('Expects that the el should be set for the alert view but not rendered', function() {
				testView.render();
				expect(setElAlertViewSpy.calls.count()).toBe(2);
				expect(renderAlertViewSpy).not.toHaveBeenCalled();
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
				expect(BaseView.prototype.remove).toHaveBeenCalled();
			});

			it('Expects that the children views are removed', function() {
				expect(removeNavViewSpy.calls.count()).toBe(1);
				expect(removeMapViewSpy.calls.count()).toBe(1);
				expect(removeLocationViewSpy.calls.count()).toBe(1);
				expect(removeAlertViewSpy.calls.count()).toBe(1);
			});
		});

		describe('Model event listener tests', function() {
			beforeEach(function() {
				testView = new DataDiscoveryView({
					el : $testDiv,
					model : testModel
				});
				testView.render();
			});
			it('Expects the loading indicator to be shown when the dataset:updateStart event is triggered on the model', function() {
				var $loadingIndicator = $testDiv.find('.loading-indicator');
				expect($loadingIndicator.is(':visible')).toBe(false);
				testModel.trigger('dataset:updateStart');
				expect($loadingIndicator.is(':visible')).toBe(true);
			});

			it('Expects the loading indicator to be hidden when the dataset:updateFinished event is triggered on the model', function() {
				testModel.set('datasets', ['NWIS', 'PRECIP']);
				testModel.trigger('dataset:updateStart');
				testModel.trigger('dataset:updateFinished', []);
				expect($testDiv.find('.loading-indicator').is(':visible')).toBe(false);
			});

			it('Expects that if there are no error types the success alert is shown', function() {
				testModel.set('datasets', ['NWIS', 'PRECIP']);
				testModel.trigger('dataset:updateStart');
				testModel.trigger('dataset:updateFinished', []);
				expect(showSuccessAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if there are error types the danger alert is shown', function() {
				testModel.set('datasets', ['NWIS', 'PRECIP']);
				testModel.trigger('dataset:updateStart');
				testModel.trigger('dataset:updateFinished', ['NWIS']);
				expect(showDangerAlertSpy).toHaveBeenCalled();
			});
		});
	});
});