/* jslint browser */
/* global jasmine, sinon, spyOn, expect */

define([
	'squire',
	'jquery',
	'backbone',
	'moment',
	'Config',
	'utils/geoSpatialUtils'
], function(Squire, $, Backbone, moment, Config, geoSpatialUtils) {

	describe('models/WorkflowStateModel', function() {
		var injector;
		var WorkflowStateModel, testModel;

		var fetchPrecipSpy, resetPrecipSpy ;
		var fetchSiteSpy, resetSiteSpy;
		var fetchPrecipDeferred, fetchSiteDeferred;

		beforeEach(function(done) {
			fetchPrecipSpy = jasmine.createSpy('fetchPrecipSpy');
			resetPrecipSpy = jasmine.createSpy('resetPrecipSpy');

			fetchSiteSpy = jasmine.createSpy('fetchSiteSpy');
			resetSiteSpy = jasmine.createSpy('resetSiteSpy');

			fetchPrecipDeferred = $.Deferred();
			fetchSiteDeferred = $.Deferred();

			injector = new Squire();

			injector.mock('models/PrecipitationCollection', Backbone.Collection.extend({
				fetch : fetchPrecipSpy.and.returnValue(fetchPrecipDeferred.promise()),
				reset : resetPrecipSpy
			}));
			injector.mock('models/NWISCollection', Backbone.Collection.extend({
				fetch : fetchSiteSpy.and.returnValue(fetchSiteDeferred.promise()),
				reset : resetSiteSpy
			}));
			injector.mock('utils/geoSpatialUtils', geoSpatialUtils);
			spyOn(geoSpatialUtils, 'getBoundingBox').and.returnValue({
				west : -100.0,
				south : 43.0,
				east : -99.0,
				north : 44.0
			});

			injector.require(['models/WorkflowStateModel'], function(model) {
				WorkflowStateModel = model;

				testModel = new WorkflowStateModel();
				done();
			});
		});

		afterEach(function() {
			injector.remove();
		});

		it('Expects that calling initializeDatasetCollections initializes the datasetCollections property', function() {
			testModel.initializeDatasetCollections();

			expect(testModel.attributes.datasetCollections[Config.NWIS_DATASET]).toBeDefined();
			expect(testModel.attributes.datasetCollections[Config.PRECIP_DATASET]).toBeDefined();
		});

		describe('Tests for event handlers to update the datasets', function() {
			var updateStartSpy, updateFinishedSpy;
			beforeEach(function() {
				updateStartSpy = jasmine.createSpy('updateStartSpy');
				updateFinishedSpy = jasmine.createSpy('updateFinishedSpy');
				resetSpy = jasmine.createSpy('resetSpy');

				testModel.initializeDatasetCollections();

				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '5',
					datasets : ['NWIS']
				});

				testModel.on('dataset:updateStart', updateStartSpy);
				testModel.on('dataset:updateFinished', updateFinishedSpy);

				fetchSiteSpy.calls.reset();
				fetchPrecipSpy.calls.reset();
				resetSiteSpy.calls.reset();
				resetPrecipSpy.calls.reset();
			});

			afterEach(function() {
				testModel.off('dataset:updateStart');
				testModel.off('dataset:updateFinished');
			});

			it('Expects the dataset models to be cleared and not fetched if there is not a valid bounding box', function() {
				testModel.set('radius', '');

				expect(fetchSiteSpy).not.toHaveBeenCalled();
				expect(fetchPrecipSpy).not.toHaveBeenCalled();
				expect(resetSiteSpy).toHaveBeenCalled();
				expect(resetPrecipSpy).toHaveBeenCalled();
			});

			it('Expects the dataset model to be cleared and not fetched if there are no datasets chosen', function() {
				testModel.set('datasets', []);

				expect(fetchSiteSpy).not.toHaveBeenCalled();
				expect(fetchPrecipSpy).not.toHaveBeenCalled();
				expect(resetSiteSpy).toHaveBeenCalled();
				expect(resetPrecipSpy).not.toHaveBeenCalled();
			});

			it('Expects if there is a valid boundingBox and a dataset is added that dataset is fetched', function() {
				testModel.set('datasets', ['NWIS', 'PRECIP']);

				expect(fetchSiteSpy).not.toHaveBeenCalled();
				expect(fetchPrecipSpy).toHaveBeenCalled();
				expect(resetSiteSpy).not.toHaveBeenCalled();
				expect(resetPrecipSpy).not.toHaveBeenCalled();
			});

			it('Expects that if a dataset is removed from the chosen datasets, that dataset is cleared', function() {
				testModel.set('datasets', ['NWIS', 'PRECIP']);
				fetchSiteSpy.calls.reset();
				fetchPrecipSpy.calls.reset();
				resetSiteSpy.calls.reset();
				resetPrecipSpy.calls.reset();
				testModel.set('datasets', ['NWIS']);

				expect(fetchSiteSpy).not.toHaveBeenCalled();
				expect(fetchPrecipSpy).not.toHaveBeenCalled();
				expect(resetSiteSpy).not.toHaveBeenCalled();
				expect(resetPrecipSpy).toHaveBeenCalled();
			});

			it('Expects that a dataset:updateStart event will be triggered if there is a valid bounding box regardless as whether a dataset chosen.', function() {
				updateStartSpy.calls.reset();
				testModel.set({
					datasets : [Config.NWIS_DATASET, Config.PRECIP_DATASET]
				});
				expect(updateStartSpy).toHaveBeenCalled();

				updateStartSpy.calls.reset();
				testModel.set({
					datasets : []
				});
				expect(updateStartSpy).toHaveBeenCalled();

				testModel.set({
					datasets : [Config.NWIS_DATASET]
				});
				expect(updateStartSpy).toHaveBeenCalled();
			});

			it('Expects an dataset:updateFinished event handler will be called with an empty array once all of the chosen datasets have been fetched', function() {
				updateFinishedSpy.calls.reset();
				fetchSiteDeferred.resolve();
				expect(updateFinishedSpy).toHaveBeenCalled();
			});

			it('Expects that if any of the dataset fetches failed, the event handler will be called with the array of failed datasets', function() {
				fetchSiteDeferred.reject();
				expect(updateFinishedSpy).toHaveBeenCalledWith([Config.NWIS_DATASET]);
			});

			it('Expects that a dataset:updateFinished event handler will be called with an empty array if no datasets have been chosen', function() {
				fetchSiteDeferred.resolve();
				updateFinishedSpy.calls.reset();
				testModel.set({
					datasets : []
				});

				expect(updateFinishedSpy).toHaveBeenCalledWith([]);
			});
		});

		describe('Tests for event handlers for updating the workflow step', function() {
			it('Expects that if the step changes to PROJ_LOC_STEP the location, radius, dates and datasets properties are unset', function() {
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '6',
					startDate : moment('2010-04-11', 'YYYY-MM-DD'),
					endDate : moment('2016-04-15', 'YYYY-MM-DD'),
					datasets : [Config.NWIS_DATASET, Config.PRECIP_DATASET]
				});
				testModel.set('step', Config.PROJ_LOC_STEP);

				expect(testModel.has('location')).toBe(false);
				expect(testModel.has('radius')).toBe(false);
				expect(testModel.has('datasets')).toBe(false);
				expect(testModel.has('startDate')).toBe(false);
				expect(testModel.has('endDate')).toBe(false);
			});

			it('Expects that if the step changes to PROJ_LOC_STEP the datasetCollections will be cleared', function() {
				testModel.initializeDatasetCollections();
				resetSiteSpy.calls.reset();
				resetPrecipSpy.calls.reset();
				testModel.set('step', Config.PROJ_LOC_STEP);

				expect(resetSiteSpy).toHaveBeenCalled();
				expect(resetPrecipSpy).toHaveBeenCalled();
			});

			it('Expects that if the step changes to CHOOSE_DATA_FILTERS_STEP and the previous step was PROJ_LOC_STEP that the default radius and chosen datasets are set', function() {
				testModel.set('step', Config.PROJ_LOC_STEP);
				testModel.set('location', {latitude : '43.0', longitude : '-100.0'});
				testModel.set('step', Config.CHOOSE_DATA_FILTERS_STEP);

				expect(testModel.get('radius')).toEqual(testModel.DEFAULT_CHOOSE_DATA_RADIUS);
				expect(testModel.get('datasets')).toEqual(testModel.DEFAULT_CHOSEN_DATASETS);
			});

			it('Expects that if the step changes to CHOOSE_DATA_FILTERS_STEP and the previous step was PROJ_LOC_STEP, the chosen datasets are fetched', function() {
				testModel.set('step', Config.PROJ_LOC_STEP);
				testModel.set('location', {latitude : '43.0', longitude : '-100.0'});
				fetchPrecipSpy.calls.reset();
				fetchSiteSpy.calls.reset();
				testModel.set('step', Config.CHOOSE_DATA_FILTERS_STEP);

				expect(fetchPrecipSpy).not.toHaveBeenCalled();
				expect(fetchSiteSpy).toHaveBeenCalled();
			});
		});

		describe('Tests for hasValidLocation', function() {
			it('Expects that if the model has location defined with a latitude and longitude property, true is returned', function() {
				testModel.set('location', {latitude : '43.0', longitude : '-100.0'});

				expect(testModel.hasValidLocation()).toBe(true);
			});

			it('Expects that if the model has location defined but latitude is missing or empty, false is returned', function() {
				testModel.set('location', {longitude : '-100.0'});
				expect(testModel.hasValidLocation()).toBe(false);

				testModel.set('location', {latitude : '', longitude : '-100.0'});
				expect(testModel.hasValidLocation()).toBe(false);
			});

			it('Expects that if the model has location defined, but longitude is missing or empty, false is returned', function() {
				testModel.set('location', {latitude : '43.0'});
				expect(testModel.hasValidLocation()).toBe(false);

				testModel.set('location', {latitude : '43.0', longitude : ''});
				expect(testModel.hasValidLocation()).toBe(false);
			});

			it('Expects that if the location property is missing or empty, false is returned', function() {
				expect(testModel.hasValidLocation()).toBe(false);

				testModel.set('location', {});
				expect(testModel.hasValidLocation()).toBe(false);
			});
		});

		describe('Tests for getBoundingBox', function() {
			it('Expects that if the model does not contain a valid bounding box, this function returns undefined', function() {
				testModel.set({
					radius : '5'
				});
				expect(testModel.getBoundingBox()).toBeUndefined();

				testModel.set({
					location : {latitude : '43.0', longitude : ''},
					radius : '5'
				});
				expect(testModel.getBoundingBox()).toBeUndefined();

				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : ''
				});
				expect(testModel.getBoundingBox()).toBeUndefined();
			});

			it('Expects that if the model does contain a valid bounding box then the function returns the bounding box', function() {
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '5'
				});
				expect(testModel.getBoundingBox()).toEqual({
					west : -100.0,
					south : 43.0,
					east : -99.0,
					north : 44.0
				});
				expect(geoSpatialUtils.getBoundingBox).toHaveBeenCalled();
			});
		});
	});
});