/* jslint browser: true */
/* global spyOn, jasmine, expect, sinon */

define([
	'jquery',
	'underscore',
	'leaflet',
	'Config',
	'models/WorkflowStateModel',
	'views/BaseView',
	'views/MapView'
], function($, _, L, Config, WorkflowStateModel, BaseView, MapView) {
	describe('views/MapView', function() {
		var testView;
		var $testDiv;
		var testModel;
		var testSiteCollection, testPrecipCollection;
		var fakeServer;
		var addLayerSpy, removeLayerSpy, addControlSpy, hasLayerSpy, removeMapSpy, fitBoundsSpy;

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();

			$('body').append('<div id="test-div"><div id="test-map-div"></div></div>');
			$testDiv = $('#test-div');

			addLayerSpy = jasmine.createSpy('addLayerSpy');
			removeLayerSpy = jasmine.createSpy('removeLayerSpy');
			addControlSpy = jasmine.createSpy('addControlSpy');
			removeMapSpy = jasmine.createSpy('removeMapSpy');
			hasLayerSpy = jasmine.createSpy('hasLayerSpy');
			fitBoundsSpy = jasmine.createSpy('fitBoundsSpy');
			spyOn(L, 'map').and.returnValue({
				addLayer : addLayerSpy,
				removeLayer : removeLayerSpy,
				addControl : addControlSpy,
				hasLayer : hasLayerSpy,
				remove : removeMapSpy,
				fitBounds : fitBoundsSpy,
				on : jasmine.createSpy('onSpy'),
				off : jasmine.createSpy('offSpy')
			});
			spyOn(L.control, 'layers').and.callThrough();
			spyOn(L, 'marker').and.callThrough();
			spyOn(L, 'layerGroup').and.callThrough();

			spyOn(BaseView.prototype, 'initialize').and.callThrough();
			spyOn(BaseView.prototype, 'remove').and.callThrough();

			testModel = new WorkflowStateModel();
			testModel.set('step', Config.CHOOSE_DATA_STEP);
			testModel.initializeDatasetCollections();
			testSiteCollection = testModel.get('datasetCollections')[Config.NWIS_DATASET];
			testPrecipCollection = testModel.get('datasetCollections')[Config.PRECIP_DATASET];

			testView = new MapView({
				el : '#test-div',
				mapDivId : 'test-map-div',
				model : testModel
			});
			spyOn(testView.legendControl, 'setVisibility');
		});

		afterEach(function() {
			fakeServer.restore();
			$testDiv.remove();
			testView.remove();
		});

		it('Expects that the BaseView initialize is called', function() {
			expect(BaseView.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects that the layer switcher control and legend control are created', function() {
			expect(L.control.layers).toHaveBeenCalled();
			expect(testView.controls.length).toBe(2);
		});

		it('Expects that a project location marker is created', function() {
			expect(testView.projLocationMarker).toBeDefined();
		});

		it('Expects that the dataset model\'s layer group\'s are created', function() {
			expect(testView.siteLayerGroups).toBeDefined();
			expect(testView.siteLayerGroups[Config.NWIS_DATASET]).toBeDefined();
			expect(testView.siteLayerGroups[Config.PRECIP_DATASET]).toBeDefined();
		});

		describe('Tests for render', function() {
			it('Expects that the map is created in the mapDiv with a single base layer', function() {
				testView.render();
				expect(L.map).toHaveBeenCalled();
			});

			it('Expects the layer switch control to be added to the map', function() {
				testView.render();
				expect(addControlSpy).toHaveBeenCalledWith(testView.controls[0]);
			});

			it('Expects that the siteLayerGroup and precipLayerGroup are added to the map', function() {
				var layersAdded;
				testView.render();
				layersAdded = _.map(addLayerSpy.calls.allArgs(), function(args) {
					return args[0];
				});
				expect(_.contains(layersAdded, testView.siteLayerGroups[Config.NWIS_DATASET])).toBe(true);
				expect(_.contains(layersAdded, testView.siteLayerGroups[Config.PRECIP_DATASET])).toBe(true);
			});

			it('Expects that the project location marker is not added to the map if location is not defined in the workflow state', function() {
				var layersAdded;
				testView.render();
				layersAdded = _.map(addLayerSpy.calls.allArgs(), function(args) {
					return args[0];
				});
				expect(_.contains(layersAdded, testView.projLocationMarker)).toBe(false);
			});

			it('Expect that the project location marker is added to the map if the location is defined in the workflow state', function() {
				var layersAdded;
				testModel.set('location', {latitude : 43.0, longitude : -100.0});
				testView.render();
				layersAdded = _.map(addLayerSpy.calls.allArgs(), function(args) {
					return args[0];
				});
				expect(_.contains(layersAdded, testView.projLocationMarker)).toBe(true);
			});

			it('Expects that the map extent is updated if both location and radius are defined', function() {
				testModel.set({
					location :  {latitude : 43.0, longitude : -100.0},
					radius : '2'
				});
				testView.render();
				expect(fitBoundsSpy).toHaveBeenCalled();
			});

			it('Expects that the map extent is not updated if location is not defined', function() {
				testModel.set('radius', '2');
				testView.render();
				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});

			it('Expect that the map extent is not updated if the radius is not defined', function() {
				testModel.set('location', {latitude : 43.0, longitude : -100.0});
				testView.render();
				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});

			it('Expects that the map extent is not updated if latitude is not defined in location', function() {
				testModel.set({
					location :  {latitude : '', longitude : -100.0},
					radius : '2'
				});
				testView.render();
				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});

			it('Expects that the map extent is not updated if longitude is not defined in location', function() {
				testModel.set({
					location :  {latitude : 43.0, longitude : ''},
					radius : '2'
				});
				testView.render();
				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});

			it('Expects that if render is called twice, the second call removes the map before recreating it', function() {
				testView.render();
				testView.render();
				expect(removeMapSpy).toHaveBeenCalled();
				expect(L.map.calls.count()).toBe(2);
			});

			it('Expect that the site location marker is added to the map if there are sites in the site model', function() {
				testSiteCollection.reset([{siteNo : '05464220','name': 'test', 'lat': '42.25152778', 'lon': '-92.2988889'}]);
				spyOn(testView.siteLayerGroups[Config.NWIS_DATASET], 'addLayer').and.callThrough();
				testView.render();
				expect(testView.siteLayerGroups[Config.NWIS_DATASET].addLayer.calls.count()).toBe(1);
			});

			it('Expects that the precipitation layer group contains markers for each grid', function() {
				testPrecipCollection.reset([
					{x : '1', y: '2', lon : '-100', lat : '43.0'},
					{x : '1', y: '3', lon : '-100', lat : '44.0'}
				]);
				spyOn(testView.siteLayerGroups[Config.PRECIP_DATASET], 'addLayer').and.callThrough();
				testView.render();
				expect(testView.siteLayerGroups[Config.PRECIP_DATASET].addLayer.calls.count()).toBe(2);
			});
		});

		describe('Tests for remove', function() {

			it('Expects the BaseView.prototype.remove to be called but not the map if the view hasn\'t been rendered', function() {
				testView.remove();
				expect(BaseView.prototype.remove).toHaveBeenCalled();
				expect(removeMapSpy).not.toHaveBeenCalled();
			});

			it('Expects the map remove to be called when the view is removed if the view has been rendered', function() {
				testView.render();
				testView.remove();
				expect(BaseView.prototype.remove).toHaveBeenCalled();
				expect(removeMapSpy).toHaveBeenCalled();
			});

			it('Expects siteDataViews to be removed ', function() {
				var nwisRemoveSpy = jasmine.createSpy('nwisRemoveSpy');
				var precipRemoveSpy = jasmine.createSpy('precipRemoveSpy');
				testView.siteDataViews[Config.NWIS_DATASET] = {
					remove : nwisRemoveSpy
				};
				testView.siteDataViews[Config.PRECIP_DATASET] = {
					remove : precipRemoveSpy
				};
				testView.render();
				testView.remove();

				expect(nwisRemoveSpy).toHaveBeenCalled();
				expect(precipRemoveSpy).toHaveBeenCalled();
				expect(testView.siteDataViews).toEqual({});
			});
		});

		describe('Tests for workflow model event handlers', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that if the testModel changes the step to PROJ_LOC_STEP, that the dataViews are removed and assigned undefined', function() {
				var removePrecipSpy = jasmine.createSpy('removePrecipSpy');
				var removeNWISSpy = jasmine.createSpy('removeNWISSpy');
				testView.siteataViews = {};
				testView.siteDataViews[Config.PRECIP_DATASET] = {
					remove : removePrecipSpy
				};
				testView.siteDataViews[Config.NWIS_DATASET] = {
					remove : removeNWISSpy
				};
				testModel.set('step', Config.PROJ_LOC_STEP);

				expect(removePrecipSpy).toHaveBeenCalled();
				expect(removeNWISSpy).toHaveBeenCalled();
				expect(testView.precipDataView).toBeUndefined();
			});

			it('Expects that if location goes from unset to set the marker is added to the map and it\'s location is set', function() {
				hasLayerSpy.and.returnValue(false);
				testModel.set('location', {latitude : 43.0, longitude : -100.0});
				expect(addLayerSpy.calls.mostRecent().args[0]).toEqual(testView.projLocationMarker);
				expect(testView.projLocationMarker.getLatLng()).toEqual(L.latLng(43.0, -100.0));
			});

			it('Expects that if the location is changed once the marker is on the map, that its location is updated', function() {
				addLayerSpy.calls.reset();
				hasLayerSpy.and.returnValue(false);
				testModel.set('location', {latitude : 43.0, longitude : -100.0});
				hasLayerSpy.and.returnValue(true);
				testModel.set('location', {latitude: 42.0, longitude : -101.0});
				expect(addLayerSpy.calls.count()).toBe(1);
				expect(testView.projLocationMarker.getLatLng()).toEqual(L.latLng(42.0, -101.0));
			});

			it('Expects that if the map has the marker and the location is not set, the marker will be removed from the map', function() {
				hasLayerSpy.and.returnValue(true);
				expect(removeLayerSpy).not.toHaveBeenCalled();
				testModel.set('location', {});
				expect(removeLayerSpy).toHaveBeenCalled();
			});

			it('Expect that the extent will only be updated when location and radius are defined', function() {
				fitBoundsSpy.calls.reset();
				testModel.set('location', {});
				expect(fitBoundsSpy).not.toHaveBeenCalled();

				testModel.set('location', {
					latitude : '',
					longitude : '-100.0'
				});
				expect(fitBoundsSpy).not.toHaveBeenCalled();

				testModel.set('radius', '2');
				expect(fitBoundsSpy).not.toHaveBeenCalled();

				testModel.set('location', {latitude : '43.0', longitude : '-100.0'});
				expect(fitBoundsSpy).toHaveBeenCalled();
			});

			it('Expects that if the NWIS model is updated, an updated NWIS marker is added to the map', function() {
				testSiteCollection.reset([{siteNo : '05464220','name': 'test', 'lat': '42.25152778', 'lon': '-92.2988889'}]);

				expect(testView.siteLayerGroups[Config.NWIS_DATASET].getLayers().length).toBe(1);
			});

			it('Expects that if the NWIS model is updated and then cleared, no NWIS markers will be on the map', function() {
				testSiteCollection.reset([{siteNo : '05464220','name': 'test', 'lat': '42.25152778', 'lon': '-92.2988889'}]);
				testSiteCollection.reset();

				expect(testView.siteLayerGroups[Config.NWIS_DATASET].getLayers().length).toBe(0);
			});

			it('Expects that if the precipitation collection is updated, precipitation grid points will be on the map', function() {
				testPrecipCollection.reset([
					{x : '1', y: '2', lon : '-100', lat : '43.0'},
					{x : '1', y: '3', lon : '-100', lat : '44.0'}
				]);
				expect(testView.siteLayerGroups[Config.PRECIP_DATASET].getLayers().length).toBe(2);
			});

			it('Expects that if the precipitation collection is updated then cleared, no precipitation grid points will be on the map', function() {
				testPrecipCollection.reset([
					{x : '1', y: '2', lon : '-100', lat : '43.0'},
					{x : '1', y: '3', lon : '-100', lat : '44.0'}
				]);
				testPrecipCollection.reset([]);
				expect(testView.siteLayerGroups[Config.PRECIP_DATASET].getLayers().length).toBe(0);
			});
		});

	});
});