/* jslint browser */
/* global jasmine, sinon, spyOn, expect */

define([
	'squire',
	'jquery',
	'backbone',
	'utils/geoSpatialUtils'
], function(Squire, $, Backbone, geoSpatialUtils) {

	describe('models/WorkflowStateModel', function() {
		var injector;
		var WorkflowStateModel, testModel;

		var fetchPrecipSpy, resetPrecipSpy ;
		var fetchSiteSpy, clearSiteSpy;
		var fetchPrecipDeferred, fetchSiteDeferred;

		beforeEach(function(done) {
			fetchPrecipSpy = jasmine.createSpy('fetchPrecipSpy');
			resetPrecipSpy = jasmine.createSpy('resetPrecipSpy');

			fetchSiteSpy = jasmine.createSpy('fetchSiteSpy');
			clearSiteSpy = jasmine.createSpy('clearSiteSpy');

			fetchPrecipDeferred = $.Deferred();
			fetchSiteDeferred = $.Deferred();

			injector = new Squire();

			injector.mock('models/PrecipitationCollection', Backbone.Collection.extend({
				fetch : fetchPrecipSpy.and.returnValue(fetchPrecipDeferred.promise()),
				reset : resetPrecipSpy
			}));
			injector.mock('models/SiteModel', Backbone.Model.extend({
				fetch : fetchSiteSpy.and.returnValue(fetchSiteDeferred.promise()),
				clear : clearSiteSpy
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

		it('Expects that calling initializeDatasetModels initializes the datasetModels property', function() {
			testModel.initializeDatasetModels();

			expect(testModel.attributes.datasetModels[testModel.NWIS_DATASET]).toBeDefined();
			expect(testModel.attributes.datasetModels[testModel.PRECIP_DATASET]).toBeDefined();
		});

		describe('Tests for event handlers to update the datasets', function() {
			var updateStartSpy, updateFinishedSpy;
			beforeEach(function() {
				updateStartSpy = jasmine.createSpy('updateStartSpy');
				updateFinishedSpy = jasmine.createSpy('updateFinishedSpy');

				testModel.initializeDatasetModels();

				testModel.on('dataset:updateStart', updateStartSpy);
				testModel.on('dataset:updateFinished', updateFinishedSpy);
			});

			afterEach(function() {
				testModel.off('dataset:updateStart');
				testModel.off('dataset:updateFinished');
			});

			it('Expects the dataset models to be cleared and not fetched if there is not a valid bounding box', function() {
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					datasets : ['NWIS']
				});

				expect(fetchSiteSpy).not.toHaveBeenCalled();
				expect(fetchPrecipSpy).not.toHaveBeenCalled();
				expect(clearSiteSpy).toHaveBeenCalled();
				expect(resetPrecipSpy).toHaveBeenCalled();
			});

			it('Expects the dataset models to be cleared and not fetched if there aree no datasets chosen', function() {
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '5',
					datasets : []
				});

				expect(fetchSiteSpy).not.toHaveBeenCalled();
				expect(fetchPrecipSpy).not.toHaveBeenCalled();
				expect(clearSiteSpy).toHaveBeenCalled();
				expect(resetPrecipSpy).toHaveBeenCalled();
			});

			it('Expects if there is a valid boundingBox the chosen dataset(s) are fetched, but the rest are cleared', function() {
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '5',
					datasets : [testModel.NWIS_DATASET]
				});

				expect(fetchSiteSpy).toHaveBeenCalled();
				expect(fetchPrecipSpy).not.toHaveBeenCalled();
				expect(clearSiteSpy).not.toHaveBeenCalled();
				expect(resetPrecipSpy).toHaveBeenCalled();

				fetchSiteSpy.calls.reset();
				resetPrecipSpy.calls.reset();
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '6',
					datasets : [testModel.PRECIP_DATASET]
				});

				expect(fetchSiteSpy).not.toHaveBeenCalled();
				expect(fetchPrecipSpy).toHaveBeenCalled();
				expect(clearSiteSpy).toHaveBeenCalled();
				expect(resetPrecipSpy).not.toHaveBeenCalled();

				fetchPrecipSpy.calls.reset();
				clearSiteSpy.calls.reset();
				testModel.set({
					location : {latitude : '42.0', longitude : '-100.0'},
					radius : '6',
					datasets : [testModel.NWIS_DATASET, testModel.PRECIP_DATASET]
				});

				expect(fetchSiteSpy).toHaveBeenCalled();
				expect(fetchPrecipSpy).toHaveBeenCalled();
				expect(clearSiteSpy).not.toHaveBeenCalled();
				expect(resetPrecipSpy).not.toHaveBeenCalled();
			});

			it('Expects that a dataset:updateStart event will be triggered if there is a valid bounding box and a dataset chosen.', function() {
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					datasets : [testModel.NWIS_DATASET]
				});
				expect(updateStartSpy).not.toHaveBeenCalled();

				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '5',
					datasets : []
				});
				expect(updateStartSpy).not.toHaveBeenCalled();

				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '6',
					datasets : [testModel.NWIS_DATASET]
				});
				expect(updateStartSpy).toHaveBeenCalled();
			});

			it('Expects an dataset:updateFinished event will be triggered once all of the chosen datasets have been fetched', function() {
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '6',
					datasets : [testModel.NWIS_DATASET]
				});
				expect(updateFinishedSpy).not.toHaveBeenCalled();
				fetchSiteDeferred.resolve();
				expect(updateFinishedSpy).toHaveBeenCalled();

				updateFinishedSpy.calls.reset();
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '5',
					datasets : [testModel.NWIS_DATASET, testModel.PRECIP_DATASET]
				});

				fetchSiteDeferred.resolve();
				expect(updateFinishedSpy).not.toHaveBeenCalled();
				fetchPrecipDeferred.resolve();
				expect(updateFinishedSpy).toHaveBeenCalled();
			});

			it('Expects that if any of the dataset fetches failed, the event handler will be called with the array of failed datasets', function() {
				testModel.set({
					location : {latitude : '43.0', longitude : '-100.0'},
					radius : '6',
					datasets : [testModel.NWIS_DATASET, testModel.PRECIP_DATASET]
				});
				fetchSiteDeferred.reject();
				fetchPrecipDeferred.resolve();
				expect(updateFinishedSpy).toHaveBeenCalledWith([testModel.NWIS_DATASET]);
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
			})
		});
	});
});