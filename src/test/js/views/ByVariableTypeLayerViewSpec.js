/* jslint browser: true */
/* global expect, spyOn */

define([
	'jquery',
	'underscore',
	'leaflet',
	'backbone',
	'moment',
	'Config',
	'models/BaseDatasetCollection',
	'models/BaseVariableCollection',
	'views/ByVariableTypeLayerView',
	'hbs!hb_templates/mapOps'
], function($, _, L, Backbone, moment, Config, BaseDatasetCollection, BaseVariableCollection, ByVariableTypeLayerView, mapOpsTemplate) {
	"use strict";

	describe('views/ByVariableLayerView', function() {
		var testView;
		var $testDiv;
		var testMap;
		var testCollection, testModel;
		var getATitle;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');
			$testDiv.html(mapOpsTemplate());
			testMap = L.map('map-div', {
				center : [41.0, -100.0],
				zoom : 4
			});

			getATitle = function(model) {
				return model.attributes.lat + ':' + model.attributes.lon;
			};

			testCollection = new BaseDatasetCollection([
				{
					lat : 43,
					lon : -100,
					variables : new BaseVariableCollection([{
						code : 'pcpn',
						startDate : moment('2002-01-15', Config.DATE_FORMAT),
						endDate : moment('2005-09-01', Config.DATE_FORMAT)
					}])
				},
				{
					lat : 42,
					lon : -101,
					variables : new BaseVariableCollection([{
						code : 'maxt',
						startDate : moment('2003-01-15', Config.DATE_FORMAT),
						endDate : moment('2015-09-01', Config.DATE_FORMAT)
					}])
				}
			]);
			testModel = new Backbone.Model({
				datasetCollections : {'ACIS' : testCollection, NWIS : new BaseDatasetCollection([])},
				variableKinds : ['precipitation', 'maxTemperature'],
				selectedVarKind : 'precipitation'
			});
			testView = new ByVariableTypeLayerView({
				map : testMap,
				model : testModel,
				el : $testDiv,
				datasetKind : 'ACIS',
				siteIcon : new L.Icon.Default(),
				getTitle : getATitle
			});
		});

		afterEach(function() {
			testView.remove();
			testMap.remove();
			$testDiv.remove();
		});

		it('Expects that a layer is created for each site model that contains the variable filter', function() {
			var markers;

			expect(testView.siteLayerGroup).toBeDefined();
			markers = testView.siteLayerGroup.getLayers();
			expect(markers.length).toBe(1);
			expect(_.find(markers, function(marker) {
				var latLng = marker.getLatLng();
				return ((latLng.lat === 43) && (latLng.lng === -100));
			})).toBeDefined();
		});

		describe('Tests for remove', function() {
			it('Expects that the markers are cleared from the layer group and the layer group is removed from the map', function() {
				spyOn(testMap, 'removeLayer').and.callThrough();
				testView.remove();

				expect(testView.siteLayerGroup.getLayers()).toEqual([]);
				expect(testMap.removeLayer).toHaveBeenCalledWith(testView.siteLayerGroup);
			});
		});

		describe('Tests for model event handlers', function() {
			it('Expects that if the collection is reset, the siteLayerGroup contain markers representing the new collection', function() {
				var markers;
				testCollection.reset([
					{
						lat : 43,
						lon : -100,
						variables : new BaseVariableCollection([{
								code : 'pcpn',
								startDate : moment('2002-01-15', Config.DATE_FORMAT),
								endDate : moment('2005-09-01', Config.DATE_FORMAT)
							}])
					},
					{
						lat : 42,
						lon : -101,
						variables : new BaseVariableCollection([{
								code : 'maxt',
								startDate : moment('2003-01-15', Config.DATE_FORMAT),
								endDate : moment('2015-09-01', Config.DATE_FORMAT)
							}])
					},
					{
						lat : 41,
						lon : -98,
						variables : new BaseVariableCollection([{
								code : 'pcpn',
								startDate : moment('2008-01-01', Config.DATE_FORMAT),
								endDate : moment('2010-12-31', Config.DATE_FORMAT)}])
					}
				]);
				markers = testView.siteLayerGroup.getLayers();

				expect(markers.length).toBe(2);
				expect(_.find(markers, function(marker) {
					var latLng = marker.getLatLng();
					return ((latLng.lat === 43) && (latLng.lng === -100));
				})).toBeDefined();
				expect(_.find(markers, function(marker) {
					var latLng = marker.getLatLng();
					return ((latLng.lat === 41) && (latLng.lng === -98));
				})).toBeDefined();
			});

			it('Expects that if the collection is reset to the empty collection, no site markers will be on the map', function() {
				testCollection.reset([]);

				expect(testView.siteLayerGroup.getLayers().length).toBe(0);
			});

			it('Expects that if the date filter is updated, the markers shown will be within the date filter', function() {
				var markers;
				testCollection.reset([
					{
						lat : 43,
						lon : -100,
						variables : new BaseVariableCollection([{
								code : 'pcpn',
								startDate : moment('2002-01-15', Config.DATE_FORMAT),
								endDate : moment('2005-09-01', Config.DATE_FORMAT)
							}])
					},
					{
						lat : 42,
						lon : -101,
						variables : new BaseVariableCollection([{
								code : 'maxt',
								startDate : moment('2003-01-15', Config.DATE_FORMAT),
								endDate : moment('2015-09-01', Config.DATE_FORMAT)
							}])
					},
					{
						lat : 41,
						lon : -98,
						variables : new BaseVariableCollection([{
								code : 'pcpn',
								startDate : moment('2008-01-01', Config.DATE_FORMAT),
								endDate : moment('2010-12-31', Config.DATE_FORMAT)}])
					}
				]);
				testModel.set('dataDateFilter', {start : moment('2004-01-01', Config.DATE_FORMAT), end : moment('2006-01-01', Config.DATE_FORMAT)});
				markers = testView.siteLayerGroup.getLayers();

				expect(markers.length).toBe(1);
				expect(_.find(markers, function(marker) {
					var latLng = marker.getLatLng();
					return ((latLng.lat === 43) && (latLng.lng === -100));
				})).toBeDefined();
			});

			it('Expects if the selected variable kinds is updated, the expected markers are updated', function() {
				var markers;
				testModel.set('selectedVarKind', 'maxTemperature');
				markers = testView.siteLayerGroup.getLayers();

				expect(markers.length).toBe(1);
			});
		});
	});
});