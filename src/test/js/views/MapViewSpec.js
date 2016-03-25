/* jslint browser: true */
/* global spyOn, jasmine, expect, sinon */

define([
	'jquery',
	'leaflet',
	'models/WorkflowStateModel',
	'models/SiteModel',
	'views/BaseView',
	'views/MapView'
], function($, L, WorkflowStateModel, SiteModel, BaseView, MapView) {
	describe('views/MapView', function() {
		var testView;
		var $testDiv;
		var testModel;
		var testSiteModel;
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
			addLayerGroupSpy = jasmine.createSpy('addLayerGroupSpy');
			addToGroupSpy = jasmine.createSpy('addToGroupSpy');
			spyOn(L, 'layerGroup').and.returnValue({
				addLayer: addLayerGroupSpy,
				addTo: addToGroupSpy
			});

			spyOn(BaseView.prototype, 'initialize').and.callThrough();
			spyOn(BaseView.prototype, 'remove').and.callThrough();

			testModel = new WorkflowStateModel();
			testModel.set('step', testModel.PROJ_LOC_STEP);

			testSiteModel = new SiteModel();

			testView = new MapView({
				el : '#test-div',
				mapDivId : 'test-map-div',
				model : testModel,
				sites : testSiteModel
			});
		});

		afterEach(function() {
			fakeServer.restore();
			$testDiv.remove();
			testView.remove();
		});

		it('Expects that the BaseView initialize is called', function() {
			expect(BaseView.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects that the layer switcher control is created', function() {
			expect(L.control.layers).toHaveBeenCalled();
			expect(testView.controls.length).toBe(1);
		});

		it('Expects that a project location marker is created', function() {
			expect(L.marker).toHaveBeenCalled();
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that the map is created in the mapDiv with a single base layer', function() {
				expect(L.map).toHaveBeenCalled();
			});

			it('Expects the layer switch control to be added to the map', function() {
				expect(addControlSpy).toHaveBeenCalledWith(testView.controls[0]);
			});

			it('Expects that the project location marker is not added to the map if location is not defined in the workflow state', function() {
				expect(addLayerSpy).not.toHaveBeenCalled();
			});

			it('Expect that the project location marker is added to the map if the location is defined in the workflow state', function() {
				testModel.set('location', {latitude : 43.0, longitude : -100.0});
				testView.render();
				expect(addLayerSpy).toHaveBeenCalledWith(testView.projLocationMarker);
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
				expect(removeMapSpy).toHaveBeenCalled();
				expect(L.map.calls.count()).toBe(2);
			});

			it('Expect that the site location marker is added to the map if there are sites in the site model', function() {
				testSiteModel.set({'sites': {'05464220': {'name': 'test', 'lat': '42.25152778', 'lon': '-92.2988889'}}});
				testView.render();
				expect(addLayerGroupSpy).toHaveBeenCalled();
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
		});

		describe('Tests for workflow model event handlers', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that if location goes from unset to set the marker is added to the map and it\'s location is set', function() {
				hasLayerSpy.and.returnValue(false);
				testModel.set('location', {latitude : 43.0, longitude : -100.0});
				expect(addLayerSpy).toHaveBeenCalledWith(testView.projLocationMarker);
				expect(testView.projLocationMarker.getLatLng()).toEqual(L.latLng(43.0, -100.0));
			});

			it('Expects that if the location is changed once the marker is on the map, that its location is updated', function() {
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

			it('Expects that if the site model is updated, an updated site marker is added to the map', function() {
//				addLayerSpy.calls.reset();
				testSiteModel.set({'sites': {'05464220': {'name': 'test', 'lat': '42.25152778', 'lon': '-92.2988889'}}});
				testSiteModel.trigger('sync', testSiteModel);
				expect(addLayerGroupSpy).toHaveBeenCalled();
			});
		});

	});
});