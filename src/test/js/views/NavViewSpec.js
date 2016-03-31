/* jslint browser: true */
/* global spyOn, jasmine, expect, sinon */
define([
	'jquery',
	'loglevel',
	'models/WorkflowStateModel',
	'views/BaseView',
	'views/NavView'
], function($, log, WorkflowStateModel, BaseView, NavView) {
	fdescribe('views/NavView', function() {
		var testView;
		var testModel;
		var mockRouter;
		var $testDiv;
		var fakeServer;

		var projLocSel = '.nav-project-loc';
		var chooseDataSel = '.nav-choose-data';
		var processDataSel = '.nav-process-data';

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new WorkflowStateModel({}, {
				createDatasetModels : true
			});
			testModel.set('step', testModel.PROJ_LOC_STEP);
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

			it('Expects that if the workflow step is PROJ_LOC_STEP and no location is defined, the project location nav btn is active and the choose data and process data buttons are disabled', function() {
				testView.render();
				expect(testView.$(projLocSel + ' a').hasClass('active')).toBe(true);
				expect(testView.$(chooseDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(processDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(true);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the workflow step is PROJ_LOC_STEP and location is defined, then the choose data btn is enabled', function() {
				testModel.set({
					step : testModel.PROJ_LOC_STEP,
					location : {latitude : 43.0, longitude : -100.0}
				});
				testView.render();
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the workflow step is CHOOSE_DATA_STEP the choose data btn is active and the process data step is disabled', function() {
				testModel.set({
					step : testModel.CHOOSE_DATA_STEP,
					location : {latitude : 43.0, longitude : -100.0}
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
			});

			it('Expects that clicking the choose data button, changes the step to choose data', function() {
				testModel.set({
					step : testModel.PROJ_LOC_STEP,
					location : {latitude : 43.0, longitude : -100.0}
				});
				testView.render();
				$(chooseDataSel + ' a').trigger('click');

				expect(testModel.get('step')).toEqual(testModel.CHOOSE_DATA_STEP);
			});

			it('Expects that clicking the project location button changes the step to proj loc', function() {
				testModel.set({
					step : testModel.CHOOSE_DATA_STEP,
					location : {latitude : 43.0, longitude : -100.0}
				});
				testView.render();
				$(projLocSel + ' a').trigger('click');

				expect(testModel.get('step')).toEqual(testModel.PROJ_LOC_STEP);
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

			it('Expects that if the location is defined when in the PROJ_LOC_STEP, the choose data btn becomes active', function() {
				testModel.set('location', {latitude: 43.0, longitude : -100.0});
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the step is changed to CHOOSE_DATA, the choose data btn is active', function() {
				testModel.set('location', {latitude: 43.0, longitude : -100.0});
				testModel.set('step', testModel.CHOOSE_DATA_STEP);
				expect(testView.$(projLocSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(chooseDataSel + ' a').hasClass('active')).toBe(true);
				expect(testView.$(processDataSel + ' a').hasClass('active')).toBe(false);
				expect(testView.$(projLocSel).hasClass('disabled')).toBe(false);
				expect(testView.$(chooseDataSel).hasClass('disabled')).toBe(false);
				expect(testView.$(processDataSel).hasClass('disabled')).toBe(true);
			});

			it('Expects that if the step is changed to CHOOSE_DATA, then the router will navigate to the url with the lat and lon in it', function() {
				testModel.set('step', testModel.CHOOSE_DATA_STEP);
				testModel.set({
					location : {latitude: 42.0, longitude : -101.0},
					radius : '',
					datasets : []
				});
				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/42/lng/-101/radius//dataset/']);
			});

			it('Expects that if the step is CHOOSE_DATA and the location becomes invalid that the url is not updated', function() {
				testModel.set('step', testModel.CHOOSE_DATA_STEP);
				testModel.set({
					location : {latitude: 42.0, longitude : -101.0},
					radius : '',
					datasets : []
				});

				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/42/lng/-101/radius//dataset/']);

				mockRouter.navigate.calls.reset();
				testModel.set('location', {latitude : '', longitude : -101.0});

				expect(mockRouter.navigate).not.toHaveBeenCalled();
			});

			it('Expects that if the step is CHOOSE_DATA and radius, location, start/endDate, and datasets change the router will navigate to the appropriate url', function() {
				testModel.set('location', {latitude: 43.0, longitude : -100.0});
				testModel.set('step', testModel.CHOOSE_DATA_STEP);
				testModel.set({
					radius : 2,
					datasets : ['NWIS']
				});
				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/2/dataset/NWIS']);

				testModel.set('datasets', ['NWIS', 'Precip']);
				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/2/dataset/NWIS/Precip']);

				testModel.set({
					startDate : '1Jan2000',
					endDate : '1Jan2010'
				});
				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/2/startdate/1Jan2000/enddate/1Jan2010/dataset/NWIS/Precip']);
				testModel.set('radius', 10);
				expect(mockRouter.navigate.calls.mostRecent().args).toEqual(['lat/43/lng/-100/radius/10/startdate/1Jan2000/enddate/1Jan2010/dataset/NWIS/Precip']);
			});
		});
	});
});


