/* jslint browser */
/* global expect, jasmine, spyOn */

define([
	'squire',
	'underscore',
	'jquery',
	'leaflet',
	'backbone',
	'Config',
	'models/BaseDatasetCollection',
	'models/WorkflowStateModel',
	'views/BaseView',
	'hbs!hb_templates/mapOps'
], function(Squire, _, $, L, Backbone, Config, BaseDatasetCollection, WorkflowStateModel, BaseView, mapOpsTemplate) {
	"use strict";

	describe('views/SitesLayerViewSpec', function() {
		var testView, SitesLayerView;
		var $testDiv;
		var testMap;
		var initializeBySiteLayerViewSpy, removeBySiteLayerViewSpy;
		var initializeByVariableLayerViewSpy, removeByVariableLayerViewSpy;
		var setElGLCFSDataViewSpy, renderGLCFSDataViewSpy, removeGLCFSDataViewSpy;
		var setElNWISDataViewSpy, renderNWISDataViewSpy, removeNWISDataViewSpy;
		var setElPrecipDataViewSpy, renderPrecipDataViewSpy, removePrecipDataViewSpy;
		var setElACISDataViewSpy, renderACISDataViewSpy, removeACISDataViewSpy;

		var testModel;
		var testGLCFSCollection, testNWISCollection, testPrecipCollection, testACISCollection;

		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');
			$testDiv.html(mapOpsTemplate());
			testMap = L.map('map-div', {
				center : [41.0, -100.0],
				zoom : 4
			});

			// Create spies for mocked views
			initializeBySiteLayerViewSpy = jasmine.createSpy('renderBySiteLayerViewSpy');
			removeBySiteLayerViewSpy = jasmine.createSpy('removeBySiteLayerViewSpy');

			initializeByVariableLayerViewSpy = jasmine.createSpy('renderByVariableLayerViewSpy');
			removeByVariableLayerViewSpy = jasmine.createSpy('removeByVariableLayerViewSpy');

			setElGLCFSDataViewSpy = jasmine.createSpy('setElGLCFSDataViewSpy');
			renderGLCFSDataViewSpy = jasmine.createSpy('renderGLCFSDataViewSpy');
			removeGLCFSDataViewSpy = jasmine.createSpy('removeGLCFSDataViewSpy');

			setElNWISDataViewSpy = jasmine.createSpy('setElNWISDataViewSpy');
			renderNWISDataViewSpy = jasmine.createSpy('renderNWISDataViewSpy');
			removeNWISDataViewSpy = jasmine.createSpy('removeNWISDataViewSpy');

			setElPrecipDataViewSpy = jasmine.createSpy('setElPrecipDataViewSpy');
			renderPrecipDataViewSpy = jasmine.createSpy('renderPrecipDataViewSpy');
			removePrecipDataViewSpy = jasmine.createSpy('removePrecipDataViewSpy');

			setElACISDataViewSpy = jasmine.createSpy('setElACISDataViewSpy');
			renderACISDataViewSpy = jasmine.createSpy('renderACISDataViewSpy');
			removeACISDataViewSpy = jasmine.createSpy('removeACISDataViewSpy');

			injector = new Squire();
			injector.mock('leaflet', L);
			injector.mock('views/BySiteLayerView', Backbone.View.extend({
				initialize : initializeBySiteLayerViewSpy,
				remove : removeBySiteLayerViewSpy
			}));
			injector.mock('views/ByVariableTypeLayerView', Backbone.View.extend({
				initialize : initializeByVariableLayerViewSpy,
				remove : removeByVariableLayerViewSpy
			}));
			injector.mock('views/GLCFSDataView', BaseView.extend({
				setElement : setElGLCFSDataViewSpy,
				render : renderGLCFSDataViewSpy,
				remove : removeGLCFSDataViewSpy
			}));
			injector.mock('views/NWISDataView', BaseView.extend({
				setElement : setElNWISDataViewSpy,
				render : renderNWISDataViewSpy,
				remove : removeNWISDataViewSpy
			}));
			injector.mock('views/PrecipDataView', BaseView.extend({
				setElement : setElPrecipDataViewSpy,
				render : renderPrecipDataViewSpy,
				remove : removePrecipDataViewSpy
			}));
			injector.mock('views/ACISDataView', BaseView.extend({
				setElement : setElACISDataViewSpy,
				render : renderACISDataViewSpy,
				remove : removeACISDataViewSpy
			}));

			testModel = new WorkflowStateModel();
			testGLCFSCollection = new BaseDatasetCollection();
			testNWISCollection = new BaseDatasetCollection();
			testPrecipCollection = new BaseDatasetCollection();
			testACISCollection = new BaseDatasetCollection();

			injector.require(['views/SitesLayerView'], function(View) {
				SitesLayerView = View;

				done();
			});
		});

		afterEach(function() {
			injector.remove();
			if (testView) {
				testView.remove();
			}
			testMap.remove();
			$testDiv.remove();
		});

		it('Expects that the by site layers are created if the view is instantiated when the datasetCollections are defined and the workflow step is CHOOSE_DATA_BY_SITE', function() {
			var viewArgs;
			testModel.set('datasetCollections', _.object([
				[Config.GLCFS_DATASET, testGLCFSCollection],
				[Config.NWIS_DATASET, testNWISCollection],
				[Config.Precip_DATASET, testPrecipCollection],
				[Config.ACIS_DATASET, testACISCollection]
			]));
			testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
			testView = new SitesLayerView({
				map : testMap,
				el : $testDiv,
				model : testModel
			});
			viewArgs = initializeBySiteLayerViewSpy.calls.allArgs();

			expect(initializeBySiteLayerViewSpy.calls.count()).toBe(4);
			_.each(Config.ALL_DATASETS, function(datasetKind) {
				expect(_.find(viewArgs, function(arg) {
					return arg.datasetKind = datasetKind;
				})).toBeDefined();
			});
		});

		it('Expects that the by variable layers are create if the view is instantiated when datasetCollections are defined and the workflow step is CHOOSE_DATA_BY_VARIABLES_STEP', function() {
			var viewArgs;
			testModel.set('datasetCollections', _.object([
				[Config.GLCFS_DATASET, testGLCFSCollection],
				[Config.NWIS_DATASET, testNWISCollection],
				[Config.Precip_DATASET, testPrecipCollection],
				[Config.ACIS_DATASET, testACISCollection]
			]));
			testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
			testView = new SitesLayerView({
				map : testMap,
				el : $testDiv,
				model : testModel
			});
			viewArgs = initializeByVariableLayerViewSpy.calls.allArgs();

			expect(initializeByVariableLayerViewSpy.calls.count()).toBe(4);
			_.each(Config.ALL_DATASETS, function(datasetKind) {
				expect(_.find(viewArgs, function(arg) {
					return arg.datasetKind = datasetKind;
				})).toBeDefined();
			});
		});

		it('Expects that the variableTypeFilterControl is created if the workflow step is CHOOSE_BY_SITE and variableKinds are set', function() {
			testModel.set('datasetCollections', _.object([
				[Config.GLCFS_DATASET, testGLCFSCollection],
				[Config.NWIS_DATASET, testNWISCollection],
				[Config.Precip_DATASET, testPrecipCollection],
				[Config.ACIS_DATASET, testACISCollection]
			]));
			testModel.set({
				variableKinds : ['precipiation'],
				step : Config.CHOOSE_DATA_BY_VARIABLES_STEP
			});

			testView = new SitesLayerView({
				map : testMap,
				el : $testDiv,
				model : testModel
			});
			expect(testView.variableTypeFilterControl).toBeDefined();
		});

		describe('Tests that site layers are created if the datasetCollections are initialized after the view is created', function() {
			beforeEach(function() {
				testView = new SitesLayerView({
					map : testMap,
					el : $testDiv,
					model : testModel
				});
			});

			it('Expects that the by site layers are created after the datasetCollections are initialized when the workflow step is CHOOSE_DATA_BY_SITE', function() {
				var viewArgs;
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.set('datasetCollections', _.object([
					[Config.GLCFS_DATASET, testGLCFSCollection],
					[Config.NWIS_DATASET, testNWISCollection],
					[Config.Precip_DATASET, testPrecipCollection],
					[Config.ACIS_DATASET, testACISCollection]
				]));
				viewArgs = initializeBySiteLayerViewSpy.calls.allArgs();

				expect(initializeBySiteLayerViewSpy.calls.count()).toBe(4);
				_.each(Config.ALL_DATASETS, function(datasetKind) {
					expect(_.find(viewArgs, function(arg) {
						return arg.datasetKind = datasetKind;
					})).toBeDefined();
				});
			});

			it('Expects that the by variable layers are created after the datasetCollections are initialized when the workflow step is CHOOSE_DATA_BY_VARIABLE', function() {
				var viewArgs;
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				testModel.set('datasetCollections', _.object([
					[Config.GLCFS_DATASET, testGLCFSCollection],
					[Config.NWIS_DATASET, testNWISCollection],
					[Config.Precip_DATASET, testPrecipCollection],
					[Config.ACIS_DATASET, testACISCollection]
				]));
				viewArgs = initializeByVariableLayerViewSpy.calls.allArgs();

				expect(initializeByVariableLayerViewSpy.calls.count()).toBe(4);
				_.each(Config.ALL_DATASETS, function(datasetKind) {
					expect(_.find(viewArgs, function(arg) {
						return arg.datasetKind = datasetKind;
					})).toBeDefined();
				});
			});
		});

		describe('Tests for change in variableKinds attribute in model', function() {
			beforeEach(function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				testModel.set('datasetCollections', _.object([
					[Config.GLCFS_DATASET, testGLCFSCollection],
					[Config.NWIS_DATASET, testNWISCollection],
					[Config.Precip_DATASET, testPrecipCollection],
					[Config.ACIS_DATASET, testACISCollection]
				]));
				testView = new SitesLayerView({
					map : testMap,
					el : $testDiv,
					model : testModel
				});
			});

			it('Expects that if variableKinds is changed to have a non-empty value that the variableTypeFilter is created and the selectedVarKind set to the first value in the list', function() {
				testModel.set('variableKinds', ['precipitation']);

				expect(testView.variableTypeFilterControl).toBeDefined();
				expect(testModel.get('selectedVarKind')).toEqual('precipitation');
			});

			it('Expects that if variableKinds is changed to add an additional value that the variableTypeFilter is set to that new value', function() {
				testModel.set('variableKinds', ['precipitation']);
				spyOn(testView.variableTypeFilterControl, 'updateFilterOptions').and.callThrough();
				testModel.set('variableKinds', ['precipitation', 'maxTemperature']);

				expect(testView.variableTypeFilterControl.updateFilterOptions).toHaveBeenCalled();
				expect(testModel.get('selectedVarKind')).toEqual('maxTemperature');
			});

			it('Expects that if the variableKinds is change to remove the current value, than the first value in the last is set', function() {
				testModel.set('variableKinds', ['precipitation', 'maxTemperature']);
				testModel.set('variableKinds', ['maxTemperature']);

				expect(testModel.get('selectedVarKind')).toEqual('maxTemperature');
			});

			it('Expects that if variableKinds is unset, the variableControl is removed and the selectedVarKind unset', function() {
				testModel.set('variableKinds', ['maxTemperature']);
				spyOn(testMap, 'removeControl').and.callThrough();
				testModel.set('variableKinds', []);

				expect(testMap.removeControl).toHaveBeenCalled();
				expect(testModel.has('selectedVarKind')).toBe(false);
			});
		});

		describe('Tests for selectedSite model event handler when the workflow step is CHOOSE_DATA_BY_SITE', function() {
			var testSite1Model, testSite2Model;
			beforeEach(function() {
				testSite1Model = new Backbone.Model({lat : '43', lon : '-100'});
				testSite2Model = new Backbone.Model({lat : '42', lon : '-101'});
				testACISCollection.add([testSite1Model]);
				testNWISCollection.add([testSite2Model]);
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.get('aoi').set({latitude : '42.5', longitude : '-100.5', radius : 10});
				testModel.set('datasetCollections', _.object([
					[Config.GLCFS_DATASET, testGLCFSCollection],
					[Config.NWIS_DATASET, testNWISCollection],
					[Config.Precip_DATASET, testPrecipCollection],
					[Config.ACIS_DATASET, testACISCollection]
				]));
				testView = new SitesLayerView({
					map : testMap,
					el : $testDiv,
					model : testModel
				});
			});

			it('Expects that if selectedSite is set to one of the models , the circle marker is added to the map at the expected location', function() {
				var latLng;
				spyOn(testMap, 'addLayer').and.callThrough();
				testModel.set('selectedSite', {siteModel : testSite1Model, datasetKind : 'ACIS'});

				expect(testMap.addLayer).toHaveBeenCalled();
				latLng = testMap.addLayer.calls.argsFor(0)[0].getLatLng();
				expect(latLng.lat).toEqual(43);
				expect(latLng.lng).toEqual(-100);
			});

			it('Expects that if selectedSite is moved, the circle marker location is updated', function() {
				var circleMarkerLayer, latLng;
				spyOn(testMap, 'addLayer').and.callThrough();
				testModel.set('selectedSite', {siteModel : testSite1Model, datasetKind : 'ACIS'});
				circleMarkerLayer = testMap.addLayer.calls.argsFor(0)[0];
				testModel.set('selectedSite', {siteModel : testSite2Model, datasetKind : 'NWIS'});
				latLng = circleMarkerLayer.getLatLng();

				expect(latLng.lat).toEqual(42);
				expect(latLng.lng).toEqual(-101);
			});

			it('Expects that if the selectedSite is set and then unset the circle marker is removed from the map', function() {
				var circleMarkerLayer;
				spyOn(testMap, 'addLayer').and.callThrough();
				spyOn(testMap, 'removeLayer').and.callThrough();
				testModel.set('selectedSite', {siteModel : testSite1Model, datasetKind : 'ACIS'});
				circleMarkerLayer = testMap.addLayer.calls.argsFor(0)[0];
				testModel.unset('selectedSite');

				expect(testMap.removeLayer).toHaveBeenCalled();
				expect(testMap.removeLayer.calls.argsFor(0)[0]).toBe(circleMarkerLayer);
			});

			it('Expects that if the selectedSite is set to one of the models, the expected DataView is created and rendered', function() {
				testModel.set('selectedSite', {siteModel : testSite1Model, datasetKind : 'ACIS'});

				expect(renderACISDataViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the selectedSite is changed, the current data view is removed and the expected one created and rendered', function() {
				testModel.set('selectedSite', {siteModel : testSite1Model, datasetKind : 'ACIS'});
				testModel.set('selectedSite', {siteModel : testSite2Model, datasetKind : 'NWIS'});

				expect(removeACISDataViewSpy).toHaveBeenCalled();
				expect(renderNWISDataViewSpy).toHaveBeenCalled();
			});

			it('Expects that if the selectedSite is set and then unset, the dataView is removed', function() {
				testModel.set('selectedSite', {siteModel : testSite1Model, datasetKind : 'ACIS'});
				testModel.unset('selectedSite');

				expect(removeACISDataViewSpy).toHaveBeenCalled();
			});
		});

		describe('Tests for remove when workflow step is choose by site', function() {
			var testSite1Model, testSite2Model;
			beforeEach(function() {
				testSite1Model = new Backbone.Model({lat : '43', lon : '-100'});
				testSite2Model = new Backbone.Model({lat : '42', lon : '-101'});
				testACISCollection.add([testSite1Model]);
				testNWISCollection.add([testSite2Model]);
				testModel.set('step', Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP);
				testModel.get('aoi').set({latitude : '42.5', longitude : '-100.5', radius : 10});
				testModel.set('datasetCollections', _.object([
					[Config.GLCFS_DATASET, testGLCFSCollection],
					[Config.NWIS_DATASET, testNWISCollection],
					[Config.Precip_DATASET, testPrecipCollection],
					[Config.ACIS_DATASET, testACISCollection]
				]));
				testView = new SitesLayerView({
					map : testMap,
					el : $testDiv,
					model : testModel
				});
			});
			it('Expects that if the step is CHOOSE_DATA_BY_SITE and an selectedSite is set, the views created are removed', function() {
					testModel.set('selectedSite', {siteModel : testSite1Model, datasetKind : 'ACIS'});
					testView.remove();

					expect(removeACISDataViewSpy).toHaveBeenCalled();
					expect(removeBySiteLayerViewSpy.calls.count()).toBe(4);
			});
			it('Expects that if the step is CHOOSE_DATA_BY_SITE and an selectedSite is set, the selectedSite is unset', function() {
				testModel.set('selectedSite', {siteModel : testSite1Model, datasetKind : 'ACIS'});
				testView.remove();

				expect(testModel.has('selectedSite')).toBe(false);
			});
			it('Expects that if the step is CHOOSE_DATA_BY_SITE and an selectedSite is set, the circleMarker is removed from the map', function() {
				var circleMarkerLayer;
				spyOn(testMap, 'addLayer').and.callThrough();
				spyOn(testMap, 'removeLayer').and.callThrough();
				testModel.set('selectedSite', {siteModel : testSite1Model, datasetKind : 'ACIS'});
				circleMarkerLayer = testMap.addLayer.calls.argsFor(0)[0];
				testView.remove();

				expect(testMap.removeLayer).toHaveBeenCalled();
				expect(testMap.removeLayer.calls.argsFor(0)[0]).toBe(circleMarkerLayer);
			});
		});

		describe('Tests for remove when workflow step is choose by variable type', function() {
			beforeEach(function() {
				testModel.set('step', Config.CHOOSE_DATA_BY_VARIABLES_STEP);
				testModel.get('aoi').set({latitude : '42.5', longitude : '-100.5', radius : 10});
				testModel.set('datasetCollections', _.object([
					[Config.GLCFS_DATASET, testGLCFSCollection],
					[Config.NWIS_DATASET, testNWISCollection],
					[Config.Precip_DATASET, testPrecipCollection],
					[Config.ACIS_DATASET, testACISCollection]
				]));
				testModel.set('variableKinds', ['precipitation']);
				testView = new SitesLayerView({
					map : testMap,
					el : $testDiv,
					model : testModel
				});
			});

			it('Expects that if the view is remove, the expected ByVariableLayerViews are removed', function() {
				var variableTypeFilterControl = testView.variableTypeFilterControl;
				spyOn(testMap, 'removeControl');
				testView.remove();

				expect(removeByVariableLayerViewSpy.calls.count()).toBe(4);
				expect(testMap.removeControl).toHaveBeenCalledWith(variableTypeFilterControl);
			});
		});
	});
});