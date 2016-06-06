/* jslint browser: true */

define([
	'underscore',
	'leaflet',
	'leaflet-providers',
	'loglevel',
	'Config',
	'utils/jqueryUtils',
	'utils/geoSpatialUtils',
	'utils/LUtils',
	'leafletCustomControls/legendControl',
	'views/BaseView',
	'views/PrecipDataView',
	'views/ACISDataView',
	'views/NWISDataView',
	'hbs!hb_templates/mapOps'
], function(_, L, leafletProviders, log, Config, $utils, geoSpatialUtils, LUtils, legendControl, BaseView,
		PrecipDataView, ACISDataView, NWISDataView, hbTemplate) {

	var siteIcons = _.mapObject(Config.DATASET_ICON, function(value) {
		return L.icon(value);
	});
	var getNWISTitle = function(model) {
		return model.get('name');
	};
	var getPrecipTitle = function(model) {
		return model.get('y') + ':' + model.get('x');
	};

	var getACISTitle = function(model) {
		return model.get('name');
	};

	var DataViews =_.object([
		[Config.NWIS_DATASET, NWISDataView],
		[Config.PRECIP_DATASET, PrecipDataView],
		[Config.ACIS_DATASET, ACISDataView]
	]);

	var siteMarkerOptions = _.object([
		[Config.NWIS_DATASET, {icon : siteIcons[Config.NWIS_DATASET], getTitle : getNWISTitle}],
		[Config.PRECIP_DATASET, {icon : siteIcons[Config.PRECIP_DATASET], getTitle : getPrecipTitle}],
		[Config.ACIS_DATASET, {icon : siteIcons[Config.ACIS_DATASET], getTitle : getACISTitle}]
	]);

	var MAP_WIDTH_CLASS = 'col-md-6';
	var DATA_VIEW_WIDTH_CLASS = 'col-md-6';

	var VARIABLE_CONTAINER_SEL = '.dataset-variable-container';

	var view = BaseView.extend({

		template : hbTemplate,

		/*
		 * @param {Object} options
		 *		@prop {Jquery element or selector} el
		 *		@prop {String} mapDivId - id of the div where the map should be rendered
		 *		@prop {WorkflowStateModel} model
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.mapDivId = options.mapDivId;

			this.baseLayers = {
				'World Street' : L.tileLayer.provider('Esri.WorldStreetMap'),
				'World Physical': L.tileLayer.provider('Esri.WorldPhysical'),
				'World Imagery' : L.tileLayer.provider('Esri.WorldImagery')
			};

			this.legendControl = legendControl({opened : false});
			this.controls = [
				L.control.layers(this.baseLayers, {}),
				this.legendControl
			];

			this.projLocationMarker = L.marker([0, 0], {
				draggable : true,
				title : 'Project Location'
			});
			this.projLocationMarker.on('dragend', function() {
				var latlng = this.projLocationMarker.getLatLng();
				this.model.get('aoi').set({
					latitude : latlng.lat,
					longitude : latlng.lng
				});
			}, this);

			this.siteLayerGroups = _.object(
				[Config.NWIS_DATASET, Config.PRECIP_DATASET, Config.ACIS_DATASET],
				[L.layerGroup(), L.layerGroup(), L.layerGroup()]
			);

			this.selectedSite = undefined;
		},

		render : function() {
			var self = this;
			var aoiModel = this.model.get('aoi');
			BaseView.prototype.render.apply(this, arguments);

			if (_.has(this, 'map')) {
				this.map.remove();
			}
			this.map = L.map(this.mapDivId, {
				center: [41.0, -100.0],
				zoom : 4,
				layers : [this.baseLayers['World Street']]
			});
			_.each(this.controls, function(control) {
				self.map.addControl(control);
			}, this);
			_.each(this.siteLayerGroups, function(layerGroup) {
				self.map.addLayer(layerGroup);
			});

			this.listenTo(this.model, 'change:step', this.updateWorkflowStep);
			this.updateWorkflowStep(this.model, this.model.get('step'));

			this.updateLocationMarkerAndExtent(aoiModel);
			this.listenTo(aoiModel, 'change', this.updateLocationMarkerAndExtent);

			// If the dataset collection models have already been created, then setup their listeners. Otherwise
			// wait until they have been created.
			if (this.model.has('datasetCollections')) {
				this.setupDatasetListeners(this.model, this.model.attributes.datasetCollections);
			}
			else {
				this.listenTo(this.model, 'change:datasetCollections', this.setupDatasetListeners);
			}

			return this;
		},

		remove : function() {
			if (_.has(this, 'map')) {
				this.map.remove();
			}
			this.removeDataView();

			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		removeDataView : function() {
			if (this.selectedSite) {
				this.selectedSite.dataView.remove();
				this.selectedSite = undefined;
			}
		},

		/*
		 * We have to add handlers for both click and double click. If the click handler creates
		 * a timeout function that is executed if the dblclick event does not occur before it's
		 * timeout expires.
		 */
		setUpSingleClickHandlerToCreateMarker : function() {
			var self = this;

			var clickTimeout;
			this.createMarkClickHandler = function(ev) {
				var clickToAddMarkerToMap = function() {
					self.model.set({
						location : {
							latitude : ev.latlng.lat,
							longitude : ev.latlng.lng
						}
					});
				};

				if (!clickTimeout) {
					clickTimeout = setTimeout(clickToAddMarkerToMap, 500);
				}
			};
			this.createMarkDoubleClickHandler = function() {
				if (clickTimeout) {
					clearTimeout(clickTimeout);
					clickTimeout = null;
				}
			};
			this.map.on('click', this.createMarkClickHandler);
			this.map.on('dblclick', this.createMarkDoubleClickHandler);
		},

		removeSingleClickHandler : function() {
			this.map.off('click', this.createMarkClickHandler);
			this.map.off('dbclick', this.createMarkDoubleClickHandler);
		},

		/*
		 * Model event handlers
		 */

		/*
		 * Updates the view to initialize the state to the new workflow step.
		 * @param {WorkflowStateModel} model
		 * @param {String} newStep
		 */
		updateWorkflowStep: function (model, newStep) {
			var $map = this.$('#' + this.mapDivId);
			switch (newStep) {
				case Config.PROJ_LOC_STEP:
					this.removeDataView();

					if (this.map.hasLayer(this.circleMarker)) {
						this.map.removeLayer(this.circleMarker);
					}

					if ($map.hasClass(MAP_WIDTH_CLASS)) {
						$map.removeClass(MAP_WIDTH_CLASS);
						this.map.invalidateSize();
					}
					break;

				case Config.CHOOSE_DATA_FILTERS_STEP:
					this.legendControl.setVisibility(true);
					break;
			}
		},

		/*
		 * Updates or adds a marker at location if location is valid and removes the single click handler
		 * to create the marker. Otherwise remove the marker and set up the single click handler so that
		 * a marker can be added.
		 * @param {AOIModel} aoiModel
		 * @param {Object} location - has properties latitude and longitude in order to be a valid location
		 *
		 */
		updateLocationMarkerAndExtent : function(aoiModel) {
			var mapHasMarker = this.map.hasLayer(this.projLocationMarker);
			if (aoiModel.usingProjectLocation() && (aoiModel.attributes.latitude) && aoiModel.attributes.longitude) {
				if (!mapHasMarker) {
					this.map.addLayer(this.projLocationMarker);
				}
				this.projLocationMarker.setLatLng([aoiModel.attributes.latitude, aoiModel.attributes.longitude]);
				this.removeSingleClickHandler();
				this.updateExtent(aoiModel);
			}
			else {
				if (mapHasMarker) {
					this.map.removeLayer(this.projLocationMarker);
				}
				this.setUpSingleClickHandlerToCreateMarker();
				this.$('#' + this.mapDivId).css('cursor', 'pointer');
			}
			//TODO: Handle AOI Box
		},

		updateExtent : function(aoiModel) {
			var bbox = aoiModel.getBoundingBox();
			var southwest = L.latLng(bbox.south, bbox.west);
			var northeast = L.latLng(bbox.north, bbox.east);
			this.map.fitBounds(L.latLngBounds(southwest, northeast));
		},

		setupDatasetListeners : function(model, datasetCollections) {
			this.updateAllSiteMarkers();

			this.listenTo(model, 'change:startDate', this.updateAllSiteMarkers);
			this.listenTo(model, 'change:endDate', this.updateAllSiteMarkers);

			this.listenTo(datasetCollections[Config.NWIS_DATASET], 'reset', this.updateNWISMarker);
			this.listenTo(datasetCollections[Config.PRECIP_DATASET], 'reset', this.updatePrecipGridPoints);
			this.listenTo(datasetCollections[Config.ACIS_DATASET], 'reset', this.updateACISMarker);
		},

		updateSiteMarkerLayer : function(datasetKind) {
			var self = this;
			var $mapDiv = this.$('#' + self.mapDivId);

			var siteCollection = this.model.get('datasetCollections')[datasetKind];
			var filteredSiteModels = siteCollection.getSiteModelsWithinDateFilter(this.model.get('startDate'), this.model.get('endDate'));

			var moveCircleMarker = function(latLng) {
				if (self.circleMarker) {
					self.circleMarker.setLatLng(latLng);
					if (!self.map.hasLayer(self.circleMarker)) {
						self.map.addLayer(self.circleMarker);
					}
				}
				else {
					self.circleMarker = new L.circleMarker(latLng,{
						radius : 15
					});
					self.map.addLayer(self.circleMarker);
				}
			};

			var updateDataView = function(siteModel, siteLatLng) {
				var projectLocation = L.latLng(self.model.attributes.location.latitude, self.model.attributes.location.longitude);

				self.removeDataView();
				self.selectedSite = {
					datasetKind : datasetKind,
					model : siteModel,
					dataView : new DataViews[datasetKind]({
						el : $utils.createDivInContainer(self.$(VARIABLE_CONTAINER_SEL)),
						distanceToProjectLocation : LUtils.milesBetween(projectLocation, siteLatLng).toFixed(3),
						model : siteModel,
						opened : true
					})
				};

				if (!$mapDiv.hasClass(MAP_WIDTH_CLASS)) {
					$mapDiv.addClass(MAP_WIDTH_CLASS);
					self.map.invalidateSize();
					self.$(VARIABLE_CONTAINER_SEL).addClass(DATA_VIEW_WIDTH_CLASS);
				}
				self.selectedSite.dataView.render();
			};

			// Determine if the selected site is still in the collection
			if (this.selectedSite && (this.selectedSite.datasetKind === datasetKind) &&
				!_.contains(filteredSiteModels, this.selectedSite.model)) {
				this.selectedSite.dataView.remove();
				$mapDiv.removeClass(MAP_WIDTH_CLASS);
				this.map.invalidateSize();
				this.map.removeLayer(this.circleMarker);
			}

			this.siteLayerGroups[datasetKind].clearLayers();
			_.each(filteredSiteModels, function(siteModel) {
				var latLng = L.latLng(siteModel.attributes.lat, siteModel.attributes.lon);
				var marker = L.marker(latLng, {
					icon : siteMarkerOptions[datasetKind].icon,
					title : siteMarkerOptions[datasetKind].getTitle(siteModel)
				});

				self.siteLayerGroups[datasetKind].addLayer(marker);
				marker.on('click', function(ev) {
					moveCircleMarker(latLng);
					updateDataView(siteModel, latLng);
					self.model.set('step', Config.CHOOSE_DATA_VARIABLES_STEP);
				});
			});
		},

		updateAllSiteMarkers : function() {
			_.each(Config.ALL_DATASETS, function(datasetKind) {
				this.updateSiteMarkerLayer(datasetKind);
			}, this);
		},
		/*
		 * Updates the NWIS layerGroup to reflect the sites in the nwis collection
		 */
		updateNWISMarker : function() {
			this.updateSiteMarkerLayer(Config.NWIS_DATASET);
		},

		/*
		 * Updates the precipitation layer group to reflect the grid points in precipCollection
		 */
		updatePrecipGridPoints : function() {
			this.updateSiteMarkerLayer(Config.PRECIP_DATASET);
		},

		updateACISMarker : function() {
			this.updateSiteMarkerLayer(Config.ACIS_DATASET);
		}
	});

	return view;
});

