/* jslint browser: true */
/* global spyOn, jasmine, expect, sinon */

define([
	'jquery',
	'underscore',
	'leaflet',
	'backbone',
	'Config',
	'utils/LUtils',
	'models/BaseVariableCollection',
	'models/WorkflowStateModel',
	'views/BaseView',
	'views/MapView'
], function($, _, L, Backbone, Config, LUtils, BaseVariableCollection, WorkflowStateModel, BaseView, MapView) {
	"use strict";
	describe('views/MapView', function() {
		var testView;
		var $testDiv;
		var testModel;
		var fakeServer;
		var addLayerSpy, removeLayerSpy, addControlSpy, removeControlSpy, hasLayerSpy, removeMapSpy, fitBoundsSpy;

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();

			$('body').append('<div id="test-div"><div id="test-map-div"></div></div>');
			$testDiv = $('#test-div');

			addLayerSpy = jasmine.createSpy('addLayerSpy');
			removeLayerSpy = jasmine.createSpy('removeLayerSpy');
			addControlSpy = jasmine.createSpy('addControlSpy');
			removeControlSpy = jasmine.createSpy('removeControlSpy');
			removeMapSpy = jasmine.createSpy('removeMapSpy');
			hasLayerSpy = jasmine.createSpy('hasLayerSpy');
			fitBoundsSpy = jasmine.createSpy('fitBoundsSpy');
			spyOn(L, 'map').and.returnValue({
				addLayer : addLayerSpy,
				removeLayer : removeLayerSpy,
				addControl : addControlSpy,
				removeControl : removeControlSpy,
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
			testModel.get('aoi').set({
				latitude : '',
				longitude : '',
				radius : ''
			});
			testModel.set('step', Config.SPECIFY_AOI_STEP);
			testModel.initializeDatasetCollections();

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
			expect(testView.defaultControls.length).toBe(2);
		});

		it('Expects that a project location marker is created', function() {
			expect(testView.projLocationMarker).toBeDefined();
		});

		it('Expects that a draw control and feature group is created', function() {
			expect(testView.drawnAOIFeature).toBeDefined();
			expect(testView.drawAOIControl).toBeDefined();
		});

		describe('Tests for render', function() {
			it('Expects that the map is created in the mapDiv with a single base layer', function() {
				testView.render();
				expect(L.map).toHaveBeenCalled();
			});

			it('Expects the layer switch control to be added to the map', function() {
				testView.render();
				expect(addControlSpy).toHaveBeenCalledWith(testView.defaultControls[0]);
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
				testModel.get('aoi').set({latitude : 43.0, longitude : -100.0, radius : 2});
				testView.render();
				layersAdded = _.map(addLayerSpy.calls.allArgs(), function(args) {
					return args[0];
				});
				expect(_.contains(layersAdded, testView.projLocationMarker)).toBe(true);
			});

			it('Expects that the map extent is updated if both location and radius are defined', function() {
				testModel.get('aoi').set({
					latitude : 43.0,
					longitude : -100.0,
					radius : '2'
				});
				testView.render();
				expect(fitBoundsSpy).toHaveBeenCalled();
			});

			it('Expects that the map extent is not updated if location is not defined', function() {
				testModel.get('aoi').set('radius', '2');
				testView.render();
				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});

			it('Expect that the map extent is not updated if the radius is not defined', function() {
				testModel.get('aoi').set({latitude : 43.0, longitude : -100.0});
				testView.render();
				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});

			it('Expects that the map extent is not updated if latitude is not defined in location', function() {
				testModel.get('aoi').set({
					latitude : '',
					longitude : -100.0,
					radius : '2'
				});
				testView.render();
				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});

			it('Expects that the map extent is not updated if longitude is not defined in location', function() {
				testModel.get('aoi').set({
					latitude : 43.0,
					longitude : '',
					radius : '2'
				});
				testView.render();
				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});

			it('Expects that the draw control is added if the aoi model has the aoiBox property', function() {
				var aoiModel = testModel.get('aoi');
				aoiModel.clear();
				aoiModel.set('aoiBox', {});
				testView.render();

				expect(_.find(addControlSpy.calls.allArgs()), function(argArray) {
					return argArray[0] === testView.drawAOIControl;
				}).toBeDefined();
				expect(_.find(addLayerSpy.calls.allArgs()), function(argArray) {
					return argArray[0] === testView.drawnAOIFeature;
				}).toBeDefined();
			});

			it('Expects that the AOI box is drawn if aoiBox property has a valid bounding box', function() {
				var aoiModel = testModel.get('aoi');
				var testAOIBox = {
					south : 42.0,
					west : -101.0,
					north : 43.0,
					east : -100.0
				};
				var drawnFeatureLayers;
				aoiModel.clear();
				aoiModel.set('aoiBox', testAOIBox);
				testView.render();

				drawnFeatureLayers = testView.drawnAOIFeature.getLayers();
				expect(drawnFeatureLayers.length).toBe(1);
				expect(drawnFeatureLayers[0].getBounds()).toEqual(LUtils.getLatLngBounds(testAOIBox));
			});

			it('Expects that there will be no AOI box drawn if the aoiBox property is empty', function() {
				var aoiModel = testModel.get('aoi');
				aoiModel.clear();
				aoiModel.set('aoiBox', {});
				testView.render();

				expect(testView.drawnAOIFeature.getLayers().length).toBe(0);
			});

			it('Expects that the map extent is updated if the aoiBox property contains a valid box', function() {
				var aoiModel = testModel.get('aoi');
				var testAOIBox = {
					south : 42.0,
					west : -101.0,
					north : 43.0,
					east : -100.0
				};
				aoiModel.clear();
				aoiModel.set('aoiBox', testAOIBox);
				testView.render();

				expect(fitBoundsSpy).toHaveBeenCalledWith(LUtils.getLatLngBounds(testAOIBox));
			});

			it('Expects that the map extent is not updated if the aoiBox property is empty', function() {
				var aoiModel = testModel.get('aoi');
				aoiModel.clear();
				aoiModel.set('aoiBox', {});
				testView.render();

				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});

			it('Expects that if render is called twice, the second call removes the map before recreating it', function() {
				testView.render();
				testView.render();
				expect(removeMapSpy).toHaveBeenCalled();
				expect(L.map.calls.count()).toBe(2);
			});

			it('Expects that the sitesLayerView is created if the workflow step if CHOOSE_DATA_BY_SITE_FILTERS_STEP', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testView.render();

				expect(testView.sitesLayerView).toBeDefined();
			});

			it('Expects that the sitesLayerView is created if the workflow step if CHOOSE_DATA_BY_VARIABLES_STEP', function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				testView.render();

				expect(testView.sitesLayerView).toBeDefined();
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

			it('Expects the sitesLayerView to be removed if it has been created', function() {
				var sitesLayerView;
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testView.render();
				sitesLayerView = testView.sitesLayerView;
				spyOn(sitesLayerView, 'remove').and.callThrough();
				testView.remove();

				expect(sitesLayerView.remove).toHaveBeenCalled();
			});
		});

		describe('Tests for workflow model event handlers', function() {

			it('Expects that if the step changes from CHOOSE_DATA_BY_SITE_STEP to SPECIFY_AOI_STEP, the sitesLayerView is removed', function() {
				var sitesLayerView;
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testView.render();
				sitesLayerView = testView.sitesLayerView;
				spyOn(sitesLayerView, 'remove').and.callThrough();
				testModel.set('step', Config.SPECIFY_AOI_STEP);

				expect(sitesLayerView.remove).toHaveBeenCalled();
				expect(testView.sitesLayerView).toBeUndefined();
			});

			it('Expects that if the step changes from SPECIFY_AOI_STEP to CHOOSE_DATA_BY_SITE_FILTERS_STEP, the sitesLayerView is created', function() {
				testView.render();
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);

				expect(testView.sitesLayerView).toBeDefined();
			});

			it('Expects that if the step changes from SPECIFY_AOI_STEP to CHOOSE_DATA_BY_VARIABLES_STEP, the sitesLayerView is created', function() {
				testView.render();
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);

				expect(testView.sitesLayerView).toBeDefined();
			});

			it('Expects that if location goes from unset to set the marker is added to the map and it\'s location is set', function() {
				testView.render();
				hasLayerSpy.and.returnValue(false);
				testModel.get('aoi').set({latitude : 43.0, longitude : -100.0, radius: 2});
				expect(addLayerSpy.calls.mostRecent().args[0]).toEqual(testView.projLocationMarker);
				expect(testView.projLocationMarker.getLatLng()).toEqual(L.latLng(43.0, -100.0));
			});

			it('Expects that if the location is changed once the marker is on the map, that its location is updated', function() {
				var aoiModel = testModel.get('aoi');
				testView.render();
				addLayerSpy.calls.reset();
				hasLayerSpy.and.returnValue(false);
				aoiModel.set({latitude : 43.0, longitude : -100.0, radius: 2});
				hasLayerSpy.and.returnValue(true);
				aoiModel.set({latitude: 42.0, longitude : -101.0, radius: 2});

				expect(addLayerSpy.calls.count()).toBe(1);
				expect(testView.projLocationMarker.getLatLng()).toEqual(L.latLng(42.0, -101.0));
			});

			it('Expects that if the map has the marker and the location is not set, the marker will be removed from the map', function() {
				testView.render();
				hasLayerSpy.and.returnValue(true);
				expect(removeLayerSpy).not.toHaveBeenCalled();
				testModel.get('aoi').set({radius : '5'});
				expect(removeLayerSpy).toHaveBeenCalled();
			});

			it('Expect that the extent will only be updated when location and radius are defined', function() {
				var aoiModel = testModel.get('aoi');
				testView.render();
				fitBoundsSpy.calls.reset();
				aoiModel.set({
					latitude : '',
					longitude : '-100.0',
					radius: 2
				});
				expect(fitBoundsSpy).not.toHaveBeenCalled();

				aoiModel.set('radius', '2');
				expect(fitBoundsSpy).not.toHaveBeenCalled();

				aoiModel.set({latitude : '43.0', longitude : '-100.0', radius: 2});
				expect(fitBoundsSpy).toHaveBeenCalled();
			});
		});

		describe('Model event tests when the aoi model has the aoiBox property set rather than the location properties', function() {
			var aoiModel;
			beforeEach(function() {
				aoiModel = testModel.get('aoi');
				aoiModel.clear();
				aoiModel.set('aoiBox', {});
				testView.render();
			});

			it('Expects that if the aoiBox property changes to contain a valid box, the map will contain a feature layer containing that box and the extent will change to fit that box', function() {
				var drawnLayers;
				var testBox = {
					south : 42.0,
					west : -101.0,
					north : 43.0,
					east : -100.0
				};
				fitBoundsSpy.calls.reset();
				aoiModel.set('aoiBox', testBox);
				drawnLayers = testView.drawnAOIFeature.getLayers();

				expect(drawnLayers.length).toBe(1);
				expect(drawnLayers[0].getBounds()).toEqual(LUtils.getLatLngBounds(testBox));
				expect(fitBoundsSpy).toHaveBeenCalledWith(LUtils.getLatLngBounds(testBox));
			});

			it('Expects that if the aoiBox property changes from a valid box to an empty property, the map will no longer contain a feature layer and the extent will not change', function() {
				aoiModel.set('aoiBox', {
					south : 42.0,
					west : -101.0,
					north : 43.0,
					east : -100.0
				});
				fitBoundsSpy.calls.reset();
				aoiModel.set('aoiBox', {});

				expect(testView.drawnAOIFeature.getLayers().length).toBe(0);
				expect(fitBoundsSpy).not.toHaveBeenCalled();
			});
		});
	});
});