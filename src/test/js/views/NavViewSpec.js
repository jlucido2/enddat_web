/* jslint browser: true */
/* global spyOn, jasmine, expect, sinon */
define([
	'jquery',
	'loglevel',
	'moment',
	'Config',
	'models/WorkflowStateModel',
	'views/BaseView',
	'views/NavView'
], function($, log, moment, Config, WorkflowStateModel, BaseView, NavView) {
	"use strict";

	describe('views/NavView', function() {
		var testView;
		var testModel;
		var mockRouter;
		var $testDiv;
		var fakeServer;

		var projLocSel = '.nav-specify-aoi';
		var chooseDataSel = '.nav-choose-data';
		var processDataSel = '.nav-process-data';

		var DATE_FORMAT = 'DMMMYYYY';

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			spyOn($.fn, 'modal').and.callThrough();

			testModel = new WorkflowStateModel({}, {
				createDatasetModels : true
			});

			testModel.set('step', Config.SPECIFY_AOI_STEP);
			testModel.get('aoi').set({
				latitude : '',
				longitude : '',
				radius : ''
			});
			mockRouter = jasmine.createSpyObj('mockRouter', ['navigate']);
			log.setLevel('silent');
		});

		afterEach(function() {
			fakeServer.restore();
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		it('Expects BaseView.initialize to be called when the view is instantiated', function() {
			spyOn(BaseView.prototype, 'initialize').and.callThrough();
			testView = new NavView({
				el :$testDiv,
				model : testModel,
				router : mockRouter
			});
			expect(BaseView.prototype.initialize).toHaveBeenCalled();
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView = new NavView({
					el : $testDiv,
					model : testModel,
					router : mockRouter
				});
			});

			it('Expects that BaseView.render is called when the view is rendered', function() {
				spyOn(BaseView.prototype, 'render').and.callThrough();
				testView.render();
				expect(BaseView.prototype.render).toHaveBeenCalled();
			});

			it('Expects that the warning modal will be initialized', function() {
				testView.render();

				expect($.fn.modal).toHaveBeenCalled();
			});

			it('Expects that if the workflow step is SPECIFY_AOI_STEP and no location is defined, the project location nav btn is active and the choose data and process data buttons are disabled', function() {
				testModel.set({
					step : Config.SPECIFY_AOI_STEP
				});
				testView.render();

				expect(testView.$(projLocSel + ' a').hasClass('active')).toBe(true);
				expect(testView.$(chooseDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(processDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(true);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the workflow step is SPECIFY_AOI_STEP and location and radius are defined, then the choose data btn is enabled', function() {
				testModel.get('aoi').set({
					latitude : 43.0,
					longitude : -100.0,
					radius : 2
				});
				testModel.set({
					step : Config.SPECIFY_AOI_STEP
				});
				testView.render();
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the workflow step is CHOOSE_DATA_BY_SITE_FILTERS_STEP the choose data btn is active and the process data step is disabled', function() {
				testModel.get('aoi').set({
					latitude : 43.0,
					longitude : -100.0,
					radius : 2
				});
				testModel.set({
					step : Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP
				});
				testView.render();
				expect(testView.$(projLocSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(chooseDataSel + ' a').hasClass('active')).toBe(true);
				expect(testView.$(processDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the workflow step is CHOOSE_DATA_BY_VARIABLES_STEP the choose data btn is active and the process data step is disabled', function() {
				testModel.get('aoi').set({
					latitude : 43.0,
					longitude : -100.0,
					radius : 2
				});
				testModel.set({
					step : Config.CHOOSE_DATA_BY_VARIABLES_STEP
				});
				testView.render();
				expect(testView.$(projLocSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(chooseDataSel + ' a').hasClass('active')).toBe(true);
				expect(testView.$(processDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});
		});

		describe('Tests for DOM event handlers', function() {
			beforeEach(function() {
				testView = new NavView({
					el : $testDiv,
					model : testModel,
					router : mockRouter
				});
				testModel.get('aoi').set({
					latitude : 43.0,
					longitude : -100.0,
					radius : 2
				});
			});

			it('Expects that clicking the choose data button when the current step is SPECIFY_AOI_STEP, shows the choose workflow modal', function() {
				testModel.set('step', Config.SPECIFY_AOI_STEP);
				testView.render();
				$.fn.modal.calls.reset();
				$(chooseDataSel + ' a').trigger('click');

				expect($.fn.modal).toHaveBeenCalled();
				expect($.fn.modal.calls.mostRecent().object.hasClass('choose-data-workflow-modal')).toBe(true);
			});

			it('Expects that after clicking the choose data button and then choosing Select variables by site, the workflow step changes to CHOOSE_DATA_BY_SITE_FILTERS_STEP', function() {
				testModel.set('step', Config.SPECIFY_AOI_STEP);
				testView.render();
				$(chooseDataSel + ' a').trigger('click');
				$.fn.modal.calls.reset();
				$('.choose-data-workflow-modal select').val('chooseDataBySiteFilters').trigger('change');

				expect(testModel.get('step')).toEqual(Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				expect($.fn.modal).toHaveBeenCalledWith('hide');
				expect($.fn.modal.calls.mostRecent().object.hasClass('choose-data-workflow-modal')).toBe(true);
			});

			it('Expects that after clicking the choose data button and then choosing Selecte variables by variable type, the workflow step changes to CHOOSE_DATA_BY_VARIABLES_STEP', function() {
				testModel.set('step', Config.SPECIFY_AOI_STEP);
				testView.render();
				$(chooseDataSel + ' a').trigger('click');
				$.fn.modal.calls.reset();
				$('.choose-data-workflow-modal select').val('chooseDataByVariables').trigger('change');


				expect(testModel.get('step')).toEqual(Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				expect($.fn.modal).toHaveBeenCalledWith('hide');
				expect($.fn.modal.calls.mostRecent().object.hasClass('choose-data-workflow-modal')).toBe(true);
			});

			it('Expects that if current step is one of the CHOOSE_DATA_BY_SITE_FILTERS_STEP, the modal is shown', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testView.render();
				$.fn.modal.calls.reset();
				$(chooseDataSel + ' a').trigger('click');

				expect($.fn.modal).toHaveBeenCalled();
				expect($.fn.modal.calls.mostRecent().object.hasClass('choose-data-workflow-modal')).toBe(true);
			});

			it('Expects that if current step is one of the CHOOSE_DATA_BY_VARIABLES_STEP, the modal is shown', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				testView.render();
				$.fn.modal.calls.reset();
				$(chooseDataSel + ' a').trigger('click');

				expect($.fn.modal).toHaveBeenCalled();
				expect($.fn.modal.calls.mostRecent().object.hasClass('choose-data-workflow-modal')).toBe(true);
			});

			it('Expects that if the current step is PROCESS_DATA_STEP and the datasets property is not empty and then the choose data button is clicked, the workflow step changes to CHOOSE_DATA_BY_SITE_FILTERS_STEP', function() {
				testModel.set({
					startDate : moment('2001/01/01'),
					endDate : moment('2002/01/01')
				});
				testModel.set({
					step : Config.PROCESS_DATA_STEP,
					datasets : ['NWIS']
				});
				testView.render();
				$(chooseDataSel + ' a').trigger('click');

				expect(testModel.get('step')).toEqual(Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
			});

			it('Expects that if the current step is PROCESS_DATA_STEP and the variables property is not empty and then the choose data button is clicked, the workflow step changes to CHOOSE_DATA_BY_VARIABLES_STEP', function() {
				testModel.set({
					startDate : moment('2001/01/01'),
					endDate : moment('2002/01/01')
				});
				testModel.set({
					step : Config.PROCESS_DATA_STEP,
					variables : ['maxTemperature']
				});
				testView.render();
				$(chooseDataSel + ' a').trigger('click');

				expect(testModel.get('step')).toEqual(Config.CHOOSE_DATA_BY_VARIABLES_STEP);
			});

			it('Expects that clicking the project location button causes the warning modal to be shown', function() {
				testModel.set({
					step : Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP
				});
				testView.render();
				$.fn.modal.calls.reset();
				$(projLocSel + ' a').trigger('click');

				expect($.fn.modal).toHaveBeenCalledWith('show');
			});

			it('Expects that clicking the cancel button in the modal does nothing to the state of the workflow model', function() {
				var currentWorkflowState;
				testModel.set({
					step : Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP
				});
				currentWorkflowState = testModel.attributes;
				testView.render();
				$(projLocSel + ' a').trigger('click');
				$('.nav-warning-modal .cancel-button').trigger('click');

				expect(testModel.attributes).toEqual(currentWorkflowState);
			});

			it('Expects that clicking the ok button sets the workflow step to SPECIFY_AOI_STEP', function() {
				var currentWorkflowState;
				testModel.set({
					step : Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP
				});
				currentWorkflowState = testModel.attributes;
				testView.render();
				$(projLocSel + ' a').trigger('click');
				$('.nav-warning-modal .ok-button').trigger('click');

				expect(testModel.get('step')).toEqual(Config.SPECIFY_AOI_STEP);
			});
		});

		describe('Tests for model event handlers', function() {
			beforeEach(function() {
				testView = new NavView({
					el : $testDiv,
					model : testModel,
					router : mockRouter
				});
				testView.render();
			});

			it('Expects that if the location  and radius are defined when in the SPECIFY_AOI_STEP, the choose data btn becomes active', function() {
				testModel.get('aoi').set({latitude: 43.0, longitude : -100.0, radius : 4});

				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the step is changed to CHOOSE_DATA_BY_SITE_FILTERS_STEP, the choose data btn is active', function() {
				testModel.get('aoi').set({latitude: 43.0, longitude : -100.0, radius : 4});
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);

				expect(testView.$(projLocSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(chooseDataSel + ' a').hasClass('active')).toBe(true);
				expect(testView.$(processDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the step is changed to CHOOSE_DATA_BY_SITE_FILTERS_STEP, then the router will navigate to the url with the lat/lon and radius in it', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set('datasets', []);
				testModel.get('aoi').set({latitude: 43.0, longitude : -100.0, radius : 4});

				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/4/dataset/']);
			});

			it('Expects that if the step is CHOOSE_DATA_BY_SITE_FILTERS_STEP and the location becomes invalid that the url is not updated', function() {
				var aoiModel = testModel.get('aoi');
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set('datasets', []);
				aoiModel.set({latitude: 43.0, longitude : -100.0, radius : 4});

				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/4/dataset/']);

				mockRouter.navigate.calls.reset();
				aoiModel.set({latitude : '', longitude : -101.0});

				expect(mockRouter.navigate).not.toHaveBeenCalled();
			});

			it('Expects that if the step is CHOOSE_DATA_BY_SITE_FILTERS_STEP and radius, location, start/endDate, and datasets change the router will navigate to the appropriate url', function() {
				var aoiModel = testModel.get('aoi');
				aoiModel.set({latitude: 43.0, longitude : -100.0, radius : 2});
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set({
					datasets : ['NWIS']
				});
				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/2/dataset/NWIS']);

				testModel.set('datasets', ['NWIS', 'Precip']);
				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/2/dataset/NWIS/Precip']);

				testModel.set({
					startDate : moment('1Jan2000', DATE_FORMAT),
					endDate : moment('1Jan2010', DATE_FORMAT)
				});
				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/2/startdate/1Jan2000/enddate/1Jan2010/dataset/NWIS/Precip']);
				aoiModel.set('radius', 10);
				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/10/startdate/1Jan2000/enddate/1Jan2010/dataset/NWIS/Precip']);
			});

			it('Expects that if the step is CHOOSE_DATA_BY_SITE_FILTERS_STEP and changed to CHOOSE_DATA_BY_SITE_VARIABLES_STEP, the choose data btn remains active', function() {
				testModel.get('aoi').set({latitude: 43.0, longitude : -100.0, radius : 4});
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);

				expect(testView.$(projLocSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(chooseDataSel + ' a').hasClass('active')).toBe(true);
				expect(testView.$(processDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the step is CHOOSE_DATA_BY_SITE_VARIABLES_STEP and the hasSelectedVariables is changed to true, the process data button in enabled', function() {
				var processDataBtn = testView.$(processDataSel);
				testModel.get('aoi').set({latitude: 43.0, longitude : -100.0, radius : 4});
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);

				expect(processDataBtn.hasClass('disabled')).toBe(true);

				testModel.set('hasSelectedVariables', true);

				expect(processDataBtn.hasClass('disabled')).toBe(false);
			});

			it('Expects that if the step is changed to CHOOSE_DATA_BY_VARIABLES_STEP, the choose data btn is active', function() {
				testModel.get('aoi').set({latitude: 43.0, longitude : -100.0, radius : 4});
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);

				expect(testView.$(projLocSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(chooseDataSel + ' a').hasClass('active')).toBe(true);
				expect(testView.$(processDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the step is changed to CHOOSE_DATA_BY_VARIABLES_STEP, then the router will navigate to the url with the lat/lon and radius in it', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				testModel.set('variables', []);
				testModel.get('aoi').set({latitude: 43.0, longitude : -100.0, radius : 4});

				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/4/variable/']);
			});
		});
	});
});


