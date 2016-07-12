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

		var setElNavViewSpy, renderNavViewSpy, removeNavViewSpy;
		var setElMapViewSpy, renderMapViewSpy, removeMapViewSpy;
		var setElLocationViewSpy, renderLocationViewSpy, removeLocationViewSpy, collapseLocationViewSpy, expandLocationViewSpy;
		var setElAOIBoxViewSpy, renderAOIBoxViewSpy, removeAOIBoxViewSpy, collapseAOIBoxViewSpy, expandAOIBoxViewSpy;
		var setElChooseViewSpy, renderChooseViewSpy, removeChooseViewSpy, collapseChooseViewSpy, expandChooseViewSpy;
		var setElChooseVarViewSpy, renderChooseVarViewSpy, removeChooseVarViewSpy, collapseChooseVarViewSpy, expandChooseVarViewSpy;
		var setElSummaryViewSpy, renderSummaryViewSpy, removeSummaryViewSpy, collapseSummaryViewSpy, expandSummaryViewSpy;
		var setElProcessDataViewSpy, renderProcessDataViewSpy, removeProcessDataViewSpy;
		var setElAlertViewSpy, renderAlertViewSpy, removeAlertViewSpy, showSuccessAlertSpy, showDangerAlertSpy, closeAlertSpy;

		var injector;

		beforeEach(function(done) {
			sinon.stub($, "ajax");
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

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

			setElAOIBoxViewSpy = jasmine.createSpy('setElAOIBoxViewSpy');
			renderAOIBoxViewSpy = jasmine.createSpy('renderAOIBoxViewSpy');
			removeAOIBoxViewSpy = jasmine.createSpy('removeAOIBoxViewSpy');
			collapseAOIBoxViewSpy = jasmine.createSpy('collapseAOIBoxViewSpy');
			expandAOIBoxViewSpy = jasmine.createSpy('expandAOIBoxViewSpy');

			setElChooseViewSpy = jasmine.createSpy('setElChooseViewSpy');
			renderChooseViewSpy = jasmine.createSpy('renderChooseViewSpy');
			removeChooseViewSpy = jasmine.createSpy('removeChooseViewSpy');
			collapseChooseViewSpy = jasmine.createSpy('collapseChooseViewSpy');
			expandChooseViewSpy = jasmine.createSpy('expandChooseViewSpy');

			setElChooseVarViewSpy = jasmine.createSpy('setElChooseVarViewSpy');
			renderChooseVarViewSpy = jasmine.createSpy('renderChooseVarViewSpy');
			removeChooseVarViewSpy = jasmine.createSpy('removeChooseVarViewSpy');
			collapseChooseVarViewSpy = jasmine.createSpy('collapseChooseVarViewSpy');
			expandChooseVarViewSpy = jasmine.createSpy('expandChooseVarViewSpy');

			setElSummaryViewSpy = jasmine.createSpy('setElSummaryViewSpy');
			renderSummaryViewSpy = jasmine.createSpy('renderSummaryViewSpy');
			removeSummaryViewSpy = jasmine.createSpy('removeSummaryViewSpy');
			collapseSummaryViewSpy = jasmine.createSpy('collapseSummaryViewSpy');
			expandSummaryViewSpy = jasmine.createSpy('expandSummaryViewSpy');

			setElProcessDataViewSpy = jasmine.createSpy('setElProcessDataViewSpy');
			renderProcessDataViewSpy = jasmine.createSpy('renderProcessDataViewSpy');
			removeProcessDataViewSpy = jasmine.createSpy('removeProcessDataViewSpy');

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

			injector.mock('views/AOIBoxView', BaseView.extend({
				setElement : setElAOIBoxViewSpy.and.returnValue({
					render : renderAOIBoxViewSpy
				}),
				render : renderAOIBoxViewSpy,
				remove : removeAOIBoxViewSpy,
				expand : expandAOIBoxViewSpy,
				collapse : collapseAOIBoxViewSpy
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

			injector.mock('views/ChooseByVariableKindView', BaseView.extend({
				setElement : setElChooseVarViewSpy.and.returnValue({
					render : renderChooseVarViewSpy
				}),
				render : renderChooseVarViewSpy,
				remove : removeChooseVarViewSpy,
				expand : expandChooseVarViewSpy,
				collapse : collapseChooseViewSpy
			}));

			injector.mock('views/VariableSummaryView', BaseView.extend({
				setElement : setElSummaryViewSpy.and.returnValue({
					render : renderSummaryViewSpy
				}),
				render : renderSummaryViewSpy,
				remove : removeSummaryViewSpy,
				collapse : collapseSummaryViewSpy,
				expand : expandSummaryViewSpy
			}));

			injector.mock('views/ProcessDataView', BaseView.extend({
				setElement : setElProcessDataViewSpy.and.returnValue({
					render : renderProcessDataViewSpy
				}),
				render : renderProcessDataViewSpy,
				remove : removeProcessDataViewSpy
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
				testModel.set('step', Config.SPECIFY_AOI_STEP);

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
			expect(setElAOIBoxViewSpy.calls.count()).toBe(0);
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

				testModel.set('step', testModel.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testView.render();
				expect(setElNavViewSpy.calls.count()).toBe(3);
				expect(renderNavViewSpy.calls.count()).toBe(2);

				testModel.set('step', testModel.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);
				testModel.set('dataDateFilter', {
					start : moment('2005-04-01', Config.DATE_FORMAT),
					end : moment('2009-03-11', Config.DATE_FORMAT)
				});
				testModel.set('step', Config.PROCESS_DATA_STEP);
				testView.render();
				expect(setElNavViewSpy.calls.count()).toBe(4);
				expect(renderNavViewSpy.calls.count()).toBe(3);
			});

			it('Expects that if the workflow step is SPECIFY_AOI_STEP and the aoi model contains no properties no child views other than navs are created and the workflow start container is visible', function() {
				testModel.set('step', Config.SPECIFY_AOI_STEP);
				testView.render();

				expect(setElMapViewSpy).not.toHaveBeenCalled();
				expect(renderMapViewSpy).not.toHaveBeenCalled();
				expect(setElLocationViewSpy).not.toHaveBeenCalled();
				expect(renderLocationViewSpy).not.toHaveBeenCalled();
				expect(setElChooseViewSpy).not.toHaveBeenCalled();
				expect(setElSummaryViewSpy).not.toHaveBeenCalled();
				expect(setElProcessDataViewSpy).not.toHaveBeenCalled();
				expect($testDiv.find('.workflow-start-container').is(':visible')).toBe(true);
			});

			it('Expects that if the workflow step is CHOOSE_DATA_BY_SITE_FILTERS_STEP and the aoi model contains a location, the location, map, variable summary and choose data views are created and rendered', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.get('aoi').set({
					latitude : 42.0,
					longitude : 43.0,
					radius : 2,
					datasets : []
				});
				testView.render();

				expect(setElMapViewSpy).toHaveBeenCalled();
				expect(renderMapViewSpy).toHaveBeenCalled();
				expect(setElLocationViewSpy).toHaveBeenCalled();
				expect(renderLocationViewSpy).toHaveBeenCalled();
				expect(setElAOIBoxViewSpy).not.toHaveBeenCalled();
				expect(renderAOIBoxViewSpy).not.toHaveBeenCalled();
				expect(setElChooseViewSpy).toHaveBeenCalled();
				expect(renderChooseViewSpy).toHaveBeenCalled();
				expect(setElSummaryViewSpy).toHaveBeenCalled();
				expect(renderSummaryViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the workflow step is CHOOSE_DATA_BY_SITE_FILTERS_STEP and the aoi model contains an AOI box, the location, map, variable summary and choose data views are created and rendered', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.get('aoi').set('aoiBox', {
					south : 42.0,
					west : -101.0,
					north : 43.0,
					east : -100.0
				});
				testView.render();

				expect(setElMapViewSpy).toHaveBeenCalled();
				expect(renderMapViewSpy).toHaveBeenCalled();
				expect(setElLocationViewSpy).not.toHaveBeenCalled();
				expect(renderLocationViewSpy).not.toHaveBeenCalled();
				expect(setElAOIBoxViewSpy).toHaveBeenCalled();
				expect(renderAOIBoxViewSpy).toHaveBeenCalled();
				expect(setElChooseViewSpy).toHaveBeenCalled();
				expect(renderChooseViewSpy).toHaveBeenCalled();
				expect(setElSummaryViewSpy).toHaveBeenCalled();
				expect(renderSummaryViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the workflow step is CHOOSE_DATA_BY_VARIABLES_STEP and the aoi model contains a location, the location, map, variable summary and choose variable data views are created and rendered', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				testModel.get('aoi').set({
					latitude : 42.0,
					longitude : 43.0,
					radius : 2,
					variables : []
				});
				testView.render();

				expect(setElMapViewSpy).toHaveBeenCalled();
				expect(renderMapViewSpy).toHaveBeenCalled();
				expect(setElLocationViewSpy).toHaveBeenCalled();
				expect(renderLocationViewSpy).toHaveBeenCalled();
				expect(setElAOIBoxViewSpy).not.toHaveBeenCalled();
				expect(renderAOIBoxViewSpy).not.toHaveBeenCalled();
				expect(setElChooseVarViewSpy).toHaveBeenCalled();
				expect(renderChooseVarViewSpy).toHaveBeenCalled();
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
				expect(removeAOIBoxViewSpy).not.toHaveBeenCalled();
				expect(removeChooseViewSpy).not.toHaveBeenCalled();
				expect(removeSummaryViewSpy).not.toHaveBeenCalled();
				expect(removeProcessDataViewSpy).not.toHaveBeenCalled();
				expect(removeMapViewSpy).not.toHaveBeenCalled();
			});

			it('Expects that the location and map subviews are removed if they have been created', function() {
				testModel.set('step', Config.SPECIFY_AOI_STEP);
				testView.render();
				$testDiv.find('.workflow-start-container select').val('location').trigger('change');
				testView.remove();

				expect(removeLocationViewSpy).toHaveBeenCalled();
				expect(removeChooseViewSpy).not.toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
			});

			it('Expects that the aoiBox and map subviews are removed if they have been created', function() {
				testModel.set('step', Config.SPECIFY_AOI_STEP);
				testView.render();
				$testDiv.find('.workflow-start-container select').val('aoiBox').trigger('change');
				testView.remove();

				expect(removeAOIBoxViewSpy).toHaveBeenCalled();
				expect(removeChooseViewSpy).not.toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
			});

			it('Expects that the location,map, variable summary, and choose data subviews are removed if they have been created', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.get('aoi').set({
					latitude : 42.0,
					longitude : -100.0,
					radius : 2
				});
				testView.render();
				testView.remove();

				expect(removeLocationViewSpy).toHaveBeenCalled();
				expect(removeChooseViewSpy).toHaveBeenCalled();
				expect(removeSummaryViewSpy).toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
			});

			it('Expects that the AOI box, map, variable summary, and choose data subviews are removed if they have been created', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.get('aoi').set('aoiBox', {
					south : 42.0,
					west : -101.0,
					north : 41.0,
					east : -100.0
				});
				testView.render();
				testView.remove();

				expect(removeAOIBoxViewSpy).toHaveBeenCalled();
				expect(removeChooseViewSpy).toHaveBeenCalled();
				expect(removeSummaryViewSpy).toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
			});

			it('Expects that the location,map, variable summary, and choose variable type data subviews are removed if they have been created', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				testModel.get('aoi').set({
					latitude : 42.0,
					longitude : -100.0,
					radius : 2
				});
				testView.render();
				testView.remove();

				expect(removeLocationViewSpy).toHaveBeenCalled();
				expect(removeChooseVarViewSpy).toHaveBeenCalled();
				expect(removeSummaryViewSpy).toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
			});

			it('Expects that the variable summary and process data subviews are removed when the step is PROCESS_DATA_STEP', function() {
				testModel.set('dataDateFilter', {
					start : moment('2005-04-01', Config.DATE_FORMAT),
					end : moment('2009-03-11', Config.DATE_FORMAT)
				});
				testModel.set('step', Config.PROCESS_DATA_STEP);
				testView.render();
				testView.remove();

				expect(removeSummaryViewSpy).toHaveBeenCalled();
				expect(removeProcessDataViewSpy).toHaveBeenCalled();
			});
		});

		describe('Model event listener tests', function() {
			beforeEach(function() {
				testView = new DataDiscoveryView({
					el : $testDiv,
					model : testModel
				});
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.get('aoi').set({
					latitude : 42.0,
					longitude : -100.0,
					radius : 2
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

			it('Expects that if the dataDateFilter property is changed the success alert is shown', function() {
				showSuccessAlertSpy.calls.reset();
				testModel.set('dataDateFilter', {
					start : moment('2000-01-02', Config.DATE_FORMAT),
					end : moment('2000-11-11', Config.DATE_FORMAT)
				});

				expect(showSuccessAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from CHOOSE_DATA_BY_SITE_FILTERS_STEP to SPECIFY_AOI_STEP, the location view, choose view and summary view are removed', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				removeChooseViewSpy.calls.reset();
				removeSummaryViewSpy.calls.reset();
				removeLocationViewSpy.calls.reset();
				testModel.set('step', Config.SPECIFY_AOI_STEP);

				expect(removeChooseViewSpy).toHaveBeenCalled();
				expect(removeSummaryViewSpy).toHaveBeenCalled();
				expect(removeLocationViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from CHOOSE_DATA_BY_VARIABLES_STEP to SPECIFY_AOI_STEP, the location view, choose varview and summary view are removed', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				removeChooseVarViewSpy.calls.reset();
				removeSummaryViewSpy.calls.reset();
				removeLocationViewSpy.calls.reset();
				testModel.set('step', Config.SPECIFY_AOI_STEP);

				expect(removeChooseVarViewSpy).toHaveBeenCalled();
				expect(removeSummaryViewSpy).toHaveBeenCalled();
				expect(removeLocationViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from SPECIFY_AOI_STEP to CHOOSE_DATA_BY_SITE_FILTERS_STEP, the choose view and summary views are created and rendered', function() {
				testModel.set('step', Config.SPECIFY_AOI_STEP);
				$testDiv.find('.workflow-start-container select').val('location').trigger('change');
				setElChooseViewSpy.calls.reset();
				renderChooseViewSpy.calls.reset();
				setElSummaryViewSpy.calls.reset();
				renderSummaryViewSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);

				expect(setElChooseViewSpy).toHaveBeenCalled();
				expect(renderChooseViewSpy).toHaveBeenCalled();
				expect(setElSummaryViewSpy).toHaveBeenCalled();
				expect(renderSummaryViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from SPECIFY_AOI_STEP to CHOOSE_DATA_BY_VARIABLES_STEP, the choose variable view and summary views are created and rendered', function() {
				testModel.set('step', Config.SPECIFY_AOI_STEP);
				$testDiv.find('.workflow-start-container select').val('location').trigger('change');
				setElChooseVarViewSpy.calls.reset();
				renderChooseVarViewSpy.calls.reset();
				setElSummaryViewSpy.calls.reset();
				renderSummaryViewSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);

				expect(setElChooseVarViewSpy).toHaveBeenCalled();
				expect(renderChooseVarViewSpy).toHaveBeenCalled();
				expect(setElSummaryViewSpy).toHaveBeenCalled();
				expect(renderSummaryViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from CHOOSE_DATA_BY_SITE_FILTERS_STEP to CHOOSE_DATA_BY_SITE_VARIABLES_STEP, the location and choose views are collapsed', function() {
				collapseLocationViewSpy.calls.reset();
				collapseChooseViewSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);

				expect(collapseLocationViewSpy).toHaveBeenCalled();
				expect(collapseChooseViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from CHOOSE_DATA_BY_SITE_VARIABLES_STEP to PROCESS_DATA_STEP, the process data view is created and rendered, the location,choose, and map views are removed and variable summary is collapsed', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);
				removeLocationViewSpy.calls.reset();
				removeChooseViewSpy.calls.reset();
				removeMapViewSpy.calls.reset();
				collapseSummaryViewSpy.calls.reset();
				renderProcessDataViewSpy.calls.reset();
				testModel.set('dataDateFilter', {
					start : moment('2005-04-01', Config.DATE_FORMAT),
					end : moment('2009-03-11', Config.DATE_FORMAT)
				});
				testModel.set('step', Config.PROCESS_DATA_STEP);

				expect(removeLocationViewSpy).toHaveBeenCalled();
				expect(removeChooseViewSpy).toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
				expect(collapseSummaryViewSpy).toHaveBeenCalled();
				expect(renderProcessDataViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from CHOOSE_DATA_BY_VARIABLES_STEP to PROCESS_DATA_STEP, the process data view is created and rendered, the location,choose, and map views are removed and variable summary is collapsed', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				removeLocationViewSpy.calls.reset();
				removeChooseVarViewSpy.calls.reset();
				removeMapViewSpy.calls.reset();
				collapseSummaryViewSpy.calls.reset();
				renderProcessDataViewSpy.calls.reset();
				testModel.set('dataDateFilter', {
					start : moment('2005-04-01', Config.DATE_FORMAT),
					end : moment('2009-03-11', Config.DATE_FORMAT)
				});
				testModel.set('step', Config.PROCESS_DATA_STEP);

				expect(removeLocationViewSpy).toHaveBeenCalled();
				expect(removeChooseVarViewSpy).toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
				expect(collapseSummaryViewSpy).toHaveBeenCalled();
				expect(renderProcessDataViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step is PROCESS_DATA_STEP and goes back to CHOOSE_DATA_BY_SITE_FILTERS_STEP, the process data view is removed, the location, choose, and map view are created and the variable summary is shown', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);
				testModel.set('dataDateFilter', {
					start : moment('2005-04-01', Config.DATE_FORMAT),
					end : moment('2009-03-11', Config.DATE_FORMAT)
				});
				testModel.set('step', Config.PROCESS_DATA_STEP);
				renderLocationViewSpy.calls.reset();
				renderChooseViewSpy.calls.reset();
				renderMapViewSpy.calls.reset();
				expandSummaryViewSpy.calls.reset();
				removeProcessDataViewSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);

				expect(renderLocationViewSpy).toHaveBeenCalled();
				expect(renderChooseViewSpy).toHaveBeenCalled();
				expect(renderMapViewSpy).toHaveBeenCalled();
				expect(expandSummaryViewSpy).toHaveBeenCalled();
				expect(removeProcessDataViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step is PROCESS_DATA_STEP and goes back to CHOOSE_DATA_BY_VARIABLES_STEP, the process data view is removed, the location, choose variable, and map view are created and the variable summary is shown', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				testModel.set({
					dataDateFilter : {
						start : moment('2005-04-01', Config.DATE_FORMAT),
						end : moment('2009-03-11', Config.DATE_FORMAT)
					},
					variables : []
				});
				testModel.set('step', Config.PROCESS_DATA_STEP);
				renderLocationViewSpy.calls.reset();
				renderChooseVarViewSpy.calls.reset();
				renderMapViewSpy.calls.reset();
				expandSummaryViewSpy.calls.reset();
				removeProcessDataViewSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);

				expect(renderLocationViewSpy).toHaveBeenCalled();
				expect(renderChooseVarViewSpy).toHaveBeenCalled();
				expect(renderMapViewSpy).toHaveBeenCalled();
				expect(expandSummaryViewSpy).toHaveBeenCalled();
				expect(removeProcessDataViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step is PROCESS_DATA_STEP and changes to SPECIFY_AOI_STEP, the process data and summary views are removed', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);
				testModel.set('dataDateFilter', {
					start : moment('2005-04-01', Config.DATE_FORMAT),
					end : moment('2009-03-11', Config.DATE_FORMAT)
				});
				testModel.set('step', Config.PROCESS_DATA_STEP);
				removeProcessDataViewSpy.calls.reset();
				removeSummaryViewSpy.calls.reset();
				testModel.set('step', Config.SPECIFY_AOI_STEP);

				expect(removeProcessDataViewSpy).toHaveBeenCalled();
				expect(removeSummaryViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes, the alert view is closed', function() {
				closeAlertSpy.calls.reset();
				testModel.set('step', Config.SPECIFY_AOI_STEP);

				expect(closeAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if there are no datasets, the alert view is closed', function() {
				closeAlertSpy.calls.reset();
				testModel.set('datasets', null);

				expect(closeAlertSpy).toHaveBeenCalled();
			});
		});
		describe('Step changes when AOI Box is used', function() {
			beforeEach(function() {
				testView = new DataDiscoveryView({
						el : $testDiv,
						model : testModel
					});
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.get('aoi').set('aoiBox', {
					south : 42.0,
					west : -101.0,
					north : 43.0,
					east : -100.0
				});
				testView.render();
			});

			it('Expects that if the step changes from CHOOSE_DATA_BY_SITE_FILTERS_STEP to SPECIFY_AOI_STEP, the aoiBox view, choose view and summary view are removed', function() {
				removeAOIBoxViewSpy.calls.reset();
				removeChooseViewSpy.calls.reset();
				removeSummaryViewSpy.calls.reset();
				testModel.set('step', Config.SPECIFY_AOI_STEP);

				expect(removeChooseViewSpy).toHaveBeenCalled();
				expect(removeSummaryViewSpy).toHaveBeenCalled();
				expect(removeAOIBoxViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from CHOOSE_DATA_BY_SITE_FILTERS_STEP to CHOOSE_DATA_BY_SITE_VARIABLE_STEP, the aoiBox and choose views are collapsed', function() {
				collapseAOIBoxViewSpy.calls.reset();
				collapseChooseViewSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);

				expect(collapseAOIBoxViewSpy).toHaveBeenCalled();
				expect(collapseChooseViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes from CHOOSE_DATA_BY_SITE_VARIABLES_STEP to PROCESS_DATA_STEP, the process data view is created and rendered, the location,choose, and map views are removed and variable summary is collapsed', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);
				removeAOIBoxViewSpy.calls.reset();
				removeChooseViewSpy.calls.reset();
				removeMapViewSpy.calls.reset();
				collapseSummaryViewSpy.calls.reset();
				renderProcessDataViewSpy.calls.reset();
				testModel.set('dataDateFilter', {
					start : moment('2005-04-01', Config.DATE_FORMAT),
					end : moment('2009-03-11', Config.DATE_FORMAT)
				});
				testModel.set('step', Config.PROCESS_DATA_STEP);

				expect(removeAOIBoxViewSpy).toHaveBeenCalled();
				expect(removeChooseViewSpy).toHaveBeenCalled();
				expect(removeMapViewSpy).toHaveBeenCalled();
				expect(collapseSummaryViewSpy).toHaveBeenCalled();
				expect(renderProcessDataViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the step is PROCESS_DATA_STEP and goes back to CHOOSE_DATA_BY_SITE_FILTERS_STEP, the process data view is removed, the aoiBox, choose, and map view are created and the variable summary is shown', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);
				testModel.set('dataDateFilter', {
					start : moment('2005-04-01', Config.DATE_FORMAT),
					end : moment('2009-03-11', Config.DATE_FORMAT)
				});
				testModel.set('step', Config.PROCESS_DATA_STEP);
				renderAOIBoxViewSpy.calls.reset();
				renderChooseViewSpy.calls.reset();
				renderMapViewSpy.calls.reset();
				expandSummaryViewSpy.calls.reset();
				removeProcessDataViewSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);

				expect(renderAOIBoxViewSpy).toHaveBeenCalled();
				expect(renderChooseViewSpy).toHaveBeenCalled();
				expect(renderMapViewSpy).toHaveBeenCalled();
				expect(expandSummaryViewSpy).toHaveBeenCalled();
				expect(removeProcessDataViewSpy).toHaveBeenCalled();
			});
		});
	});
});