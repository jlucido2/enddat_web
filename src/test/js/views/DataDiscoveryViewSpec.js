/* jslint browser: true */
/* global jasmine, spyOn, expect, sinon */

define([
	'squire',
	'jquery',
	'moment',
	'Config',
	'models/WorkflowStateModel',
	'views/BaseView'
], function(Squire, $, moment, Config, WorkflowStateModel, BaseView) {
	"use strict";

	describe("DataDiscoveryView", function() {

		var DataDiscoveryView;
		var testView;
		var testModel;
		var $testDiv;

		var initializeBaseViewSpy, renderBaseViewSpy, removeBaseViewSpy;
		var setElNavViewSpy, renderNavViewSpy, removeNavViewSpy;
		var setElMapViewSpy, renderMapViewSpy, removeMapViewSpy;
		var setElLocationViewSpy, renderLocationViewSpy, removeLocationViewSpy, collapseLocationViewSpy, expandLocationViewSpy;
		var setElChooseViewSpy, renderChooseViewSpy, removeChooseViewSpy, collapseChooseViewSpy, expandChooseViewSpy;
		var setElSummaryViewSpy, renderSummaryViewSpy, removeSummaryViewSpy;
		var setElAlertViewSpy, renderAlertViewSpy, removeAlertViewSpy, showSuccessAlertSpy, showDangerAlertSpy, closeAlertSpy;

		var injector;

		beforeEach(function(done) {
			sinon.stub($, "ajax");
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
			collapseLocationViewSpy = jasmine.createSpy('collapseLocationViewSpy');
			expandLocationViewSpy = jasmine.createSpy('expandLocationViewSpy');

			setElChooseViewSpy = jasmine.createSpy('setElChooseViewSpy');
			renderChooseViewSpy = jasmine.createSpy('renderChooseViewSpy');
			removeChooseViewSpy = jasmine.createSpy('removeChooseViewSpy');
			collapseChooseViewSpy = jasmine.createSpy('collapseChooseViewSpy');
			expandChooseViewSpy = jasmine.createSpy('expandChooseViewSpy');


			setElSummaryViewSpy = jasmine.createSpy('setElSummaryViewSpy');
			renderSummaryViewSpy = jasmine.createSpy('renderSummaryViewSpy');
			removeSummaryViewSpy = jasmine.createSpy('removeSummaryViewSpy');

			setElAlertViewSpy = jasmine.createSpy('setElAlertViewSpy');
			renderAlertViewSpy = jasmine.createSpy('renderAlertViewSpy');
			removeAlertViewSpy = jasmine.createSpy('removeAlertViewSpy');
			showSuccessAlertSpy = jasmine.createSpy('showSuccessAlertSpy');
			showDangerAlertSpy = jasmine.createSpy('showDangerAlertSpy');
			closeAlertSpy = jasmine.createSpy('closeAlertSpy');

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
				remove : removeLocationViewSpy,
				expand : expandLocationViewSpy,
				collapse : collapseLocationViewSpy
			}));

			injector.mock('views/ChooseView', BaseView.extend({
				setElement : setElChooseViewSpy.and.returnValue({
					render : renderChooseViewSpy
				}),
				render : renderChooseViewSpy,
				remove : removeChooseViewSpy,
				expand : expandChooseViewSpy,
				collapse : collapseChooseViewSpy
			}));

			injector.mock('views/VariableSummaryView', BaseView.extend({
				setElement : setElSummaryViewSpy.and.returnValue({
					render : renderSummaryViewSpy
				}),
				render : renderSummaryViewSpy,
				remove : removeSummaryViewSpy
			}));

			injector.mock('views/AlertView', BaseView.extend({
				setElement : setElAlertViewSpy,
				render : renderAlertViewSpy,
				showSuccessAlert : showSuccessAlertSpy,
				showDangerAlert : showDangerAlertSpy,
				remove : removeAlertViewSpy,
				closeAlert : closeAlertSpy
			}));

			injector.require(['views/DataDiscoveryView'], function(view) {
				DataDiscoveryView = view;

				testModel = new WorkflowStateModel();
				spyOn(testModel, 'updateDatasetCollections');
				testModel.set('step', Config.PROJ_LOC_STEP);

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
			expect(BaseView.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects the nav and alert views to be initialized', function() {
			testView = new DataDiscoveryView({
				el : $testDiv,
				model : testModel
			});

			expect(setElNavViewSpy.calls.count()).toBe(1);
			expect(setElMapViewSpy.calls.count()).toBe(0);
			expect(setElLocationViewSpy.calls.count()).toBe(0);
			expect(setElChooseViewSpy.calls.count()).toBe(0);
			expect(setElSummaryViewSpy.calls.count()).toBe(0);
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

				testModel.set('step', Config.PROCESS_DATA_STEP);
				testView.render();
				expect(setElNavViewSpy.calls.count()).toBe(4);
				expect(renderNavViewSpy.calls.count()).toBe(3);
			});

			it('Expects that if the workflow step is PROJ_LOC_STEP, the location and map views are created and rendered but not the choose data view', function() {
				testModel.set('step', Config.PROJ_LOC_STEP);
				testView.render();

				expect(setElMapViewSpy).toHaveBeenCalled();
				expect(renderMapViewSpy).toHaveBeenCalled();
				expect(setElLocationViewSpy).toHaveBeenCalled();
				expect(renderLocationViewSpy).toHaveBeenCalled();
				expect(setElChooseViewSpy).not.toHaveBeenCalled();
				expect(setElSummaryViewSpy).not.toHaveBeenCalled();
			});

			it('Expects that if the workflow step is CHOOSE_DATA_FILTERS_STEP, the location, map, variable summary and choose data views are created and rendered', function() {
				testModel.set('step', Config.CHOOSE_DATA_FILTERS_STEP);
				testView.render();

				expect(setElMapViewSpy).toHaveBeenCalled();
				expect(renderMapViewSpy).toHaveBeenCalled();
				expect(setElLocationViewSpy).toHaveBeenCalled();
				expect(renderLocationViewSpy).toHaveBeenCalled();
				expect(setElChooseViewSpy).toHaveBeenCalled();
				expect(renderChooseViewSpy).toHaveBeenCalled();
				expect(setElSummaryViewSpy).toHaveBeenCalled();
				expect(renderSummaryViewSpy).toHaveBeenCalled();
			});
		});

		describe('Tests for remove', function() {
			beforeEach(function() {
				testView = new DataDiscoveryView({
					el : $testDiv,
					model : testModel
				});
			});

			it('Expects that the BaseView remove is called', function() {
				testView.remove();
				expect(BaseView.prototype.remove).toHaveBeenCalled();
			});

			it('Expects that the nav and alert views are removed', function() {
				testView.remove();
				expect(removeNavViewSpy).toHaveBeenCalled();
				expect(removeAlertViewSpy).toHaveBeenCalled();
				expect(removeLocationViewSpy).not.toHaveBeenCalled();
				expect(removeChooseViewSpy).not.toHaveBeenCalled();
				expect(removeSummaryViewSpy).not.toHaveBeenCalled();
				expect(removeMapViewSpy).not.toHaveBeenCalled();
			});

			it('Expects that the location and map subviews are removed if they have been created', function() {
				testModel.set('step', Config.PROJ_LOC_STEP);
				testView.render();
				testView.remove();

				expect(removeLocationViewSpy).toHaveBeenCalled();
				expect(removeChooseViewSpy).not.toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
			});

			it('Expects that the location,map, variable summary, and choose data subviews are removed if they have been created', function() {
				testModel.set('step', Config.CHOOSE_DATA_FILTERS_STEP);
				testView.render();
				testView.remove();

				expect(removeLocationViewSpy).toHaveBeenCalled();
				expect(removeChooseViewSpy).toHaveBeenCalled();
				expect(removeSummaryViewSpy).toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
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

			it('Expects that if the startDate property is changed the success alert is shown', function() {
				showSuccessAlertSpy.calls.reset();
				testModel.set('startDate', moment());

				expect(showSuccessAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if the endDate property is changed the success alert is shown', function() {
				showSuccessAlertSpy.calls.reset();
				testModel.set('endDate', moment());

				expect(showSuccessAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from CHOOSE_DATA_FILTERS_STEP to PROJ_LOC_STEP, the choose view and summary view are removed and the location view is expanded', function() {
				testModel.set('step', Config.CHOOSE_DATA_FILTERS_STEP);
				removeChooseViewSpy.calls.reset();
				removeSummaryViewSpy.calls.reset();
				testModel.set('step', Config.PROJ_LOC_STEP);

				expect(removeChooseViewSpy).toHaveBeenCalled();
				expect(removeSummaryViewSpy).toHaveBeenCalled();
				expect(expandLocationViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from PROJ_LOC_STEP to CHOOSE_DATA_FILTERS_STEP, the choose view and summary views are created and rendered', function() {
				testModel.set('step', Config.PROJ_LOC_STEP);
				setElChooseViewSpy.calls.reset();
				renderChooseViewSpy.calls.reset();
				setElSummaryViewSpy.calls.reset();
				renderSummaryViewSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_FILTERS_STEP);

				expect(setElChooseViewSpy).toHaveBeenCalled();
				expect(renderChooseViewSpy).toHaveBeenCalled();
				expect(setElSummaryViewSpy).toHaveBeenCalled();
				expect(renderSummaryViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from CHOOSE_DATA_FILTERS_STEP to CHOOSE_DATA_VARIABLE_STEP, the location and choose views are collapsed', function() {
				testModel.set('step', Config.CHOOSE_DATA_FILTERS_STEP);
				collapseLocationViewSpy.calls.reset();
				collapseChooseViewSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_VARIABLES_STEP);

				expect(collapseLocationViewSpy).toHaveBeenCalled();
				expect(collapseChooseViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes, the alert view is closed', function() {
				closeAlertSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_FILTERS_STEP);

				expect(closeAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if there are no datasets, the alert view is closed', function() {
				closeAlertSpy.calls.reset();
				testModel.set('datasets', null);

				expect(closeAlertSpy).toHaveBeenCalled();
			});
		});
	});
});