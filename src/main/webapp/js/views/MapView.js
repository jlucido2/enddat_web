/* jslint browser: true */

define([
	'underscore',
	'leaflet',
	'leaflet-draw',
	'leaflet-providers',
	'loglevel',
	'module',
	'Config',
	'utils/VariableDatasetMapping',
	'utils/jqueryUtils',
	'utils/LUtils',
	'leafletCustomControls/legendControl',
	'views/BaseView',
	'views/PrecipDataView',
	'views/GLCFSDataView',
	'views/ACISDataView',
	'views/NWISDataView',
	'hbs!hb_templates/mapOps'
], function(_, L, leafletDraw, leafletProviders, log, module, Config, variableDatasetMapping, $utils, LUtils, legendControl, BaseView,
		PrecipDataView, GLCFSDataView, ACISDataView, NWISDataView, hbTemplate) {

	var siteIcons = _.mapObject(Config.DATASET_ICON, function(value) {
		return L.icon(value);
	});

	var getGLCFSTitle = function(model) {
		return model.get('variables').at(0).get('y') + ':' + model.get('variables').at(0).get('x');
	};

	var getNWISTitle = function(model) {
		return model.get('name');
	};

	var getPrecipTitle = function(model) {
		return model.get('variables').at(0).get('y') + ':' + model.get('variables').at(0).get('x');
	};

	var getACISTitle = function(model) {
		return model.get('name');
	};

	var DataViews =_.object([
  		[Config.GLCFS_DATASET_ERIE, GLCFSDataView],
 		[Config.GLCFS_DATASET_HURON, GLCFSDataView],
 		[Config.GLCFS_DATASET_MICHIGAN, GLCFSDataView],
 		[Config.GLCFS_DATASET_ONTARIO, GLCFSDataView],
 		[Config.GLCFS_DATASET_SUPERIOR, GLCFSDataView],
		[Config.NWIS_DATASET, NWISDataView],
		[Config.PRECIP_DATASET, PrecipDataView],
		[Config.ACIS_DATASET, ACISDataView]
	]);

	var siteMarkerOptions = _.object([
  		[Config.GLCFS_DATASET_ERIE, {icon : siteIcons[Config.GLCFS_DATASET_ICON], getTitle : getGLCFSTitle}],
  		[Config.GLCFS_DATASET_HURON, {icon : siteIcons[Config.GLCFS_DATASET_ICON], getTitle : getGLCFSTitle}],
  		[Config.GLCFS_DATASET_MICHIGAN, {icon : siteIcons[Config.GLCFS_DATASET_ICON], getTitle : getGLCFSTitle}],
  		[Config.GLCFS_DATASET_ONTARIO, {icon : siteIcons[Config.GLCFS_DATASET_ICON], getTitle : getGLCFSTitle}],
  		[Config.GLCFS_DATASET_SUPERIOR, {icon : siteIcons[Config.GLCFS_DATASET_ICON], getTitle : getGLCFSTitle}],
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
			this.defaultControls = [
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
				[Config.GLCFS_DATASET_ERIE, Config.GLCFS_DATASET_HURON, Config.GLCFS_DATASET_MICHIGAN, Config.GLCFS_DATASET_ONTARIO, Config.GLCFS_DATASET_SUPERIOR, Config.NWIS_DATASET, Config.PRECIP_DATASET, Config.ACIS_DATASET],
				[L.layerGroup(), L.layerGroup(), L.layerGroup(), L.layerGroup(), L.layerGroup(), L.layerGroup(), L.layerGroup(), L.layerGroup()]
			);

			// Initialize draw control
			this.drawnAOIFeature = L.featureGroup();
			this.drawAOIControl = new L.Control.Draw({
				draw : {
					polyline : false,
					polygon : false,
					rectangle : {
						repeatMode : false
					},
					circle : false,
					marker : false
				},
				edit : {
					featureGroup : this.drawnAOIFeature,
					remove : false
				}
			});

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
			_.each(this.defaultControls, function(control) {
				self.map.addControl(control);
			}, this);
			_.each(this.siteLayerGroups, function(layerGroup) {
				self.map.addLayer(layerGroup);
			});

			// Set up the map event handlers for the draw control to update the aoi model.
			this.map.on('draw:created', function(ev) {
				this.model.get('aoi').set('aoiBox', LUtils.getBbox(ev.layer.getBounds()));
			}, this);
			this.map.on('draw:edited', function(ev) {
				this.model.get('aoi').set('aoiBox', LUtils.getBbox(ev.layers.getLayers()[0].getBounds()));
			}, this);

			// Set up model event listeners and update the map state to match the current state of the workflow model.
			this.listenTo(this.model, 'change:step', this.updateWorkflowStep);
			this.updateWorkflowStep(this.model, this.model.get('step'));

			this.updateAOILayerAndExtent(aoiModel);
			this.listenTo(aoiModel, 'change', this.updateAOILayerAndExtent);

			this.updateUploadFeatureLayer(this.model, this.model.get('uploadedFeatureName'));
			this.listenTo(this.model, 'change:uploadedFeatureName', this.updateUploadFeatureLayer);

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
					self.model.get('aoi').set({
						latitude : ev.latlng.lat,
						longitude : ev.latlng.lng
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
				case Config.SPECIFY_AOI_STEP:
					this.removeDataView();

					if (this.map.hasLayer(this.circleMarker)) {
						this.map.removeLayer(this.circleMarker);
					}

					if ($map.hasClass(MAP_WIDTH_CLASS)) {
						$map.removeClass(MAP_WIDTH_CLASS);
						this.map.invalidateSize();
					}
					break;

				case Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP:
				case Config.CHOOSE_DATA_BY_VARIABLES_STEP:
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
		updateAOILayerAndExtent : function(aoiModel) {
			var mapHasMarker = this.map.hasLayer(this.projLocationMarker);
			var mapHasAOIBox = this.map.hasLayer(this.drawnAOIFeature);
			if (aoiModel.usingProjectLocation()) {
				if ((aoiModel.attributes.latitude) && (aoiModel.attributes.longitude)) {
					if (!mapHasMarker) {
						this.map.addLayer(this.projLocationMarker);
					}
					this.projLocationMarker.setLatLng([aoiModel.attributes.latitude, aoiModel.attributes.longitude]);
					this.removeSingleClickHandler();
				}
				else {
					if (mapHasMarker) {
						this.map.removeLayer(this.projLocationMarker);
					}
					this.setUpSingleClickHandlerToCreateMarker();
					this.$('#' + this.mapDivId).css('cursor', 'pointer');
				}
			}
			else if (aoiModel.usingAOIBox()) {
				// Assuming that once the drawAOIFeature is on the map, it can only be changed via the map.
				if (!mapHasAOIBox) {
					this.map.addLayer(this.drawnAOIFeature);
					this.map.addControl(this.drawAOIControl);
				}
				if (aoiModel.hasValidAOI()) {
					var aoiLayers = this.drawnAOIFeature.getLayers();
					var newLatLngBounds = LUtils.getLatLngBounds(aoiModel.get('aoiBox'));
					if (aoiLayers.length === 0) {
						this.drawnAOIFeature.addLayer(L.rectangle(newLatLngBounds, {}));
					}
					else {
						aoiLayers[0].setBounds(newLatLngBounds);
					}
				}
				else {
					this.drawnAOIFeature.clearLayers();
				}
			}
			else {
				if (mapHasAOIBox) {
					this.map.removeControl(this.drawAOIControl);
					this.map.removeLayer (this.drawnAOIFeature);
				}
				if (mapHasMarker) {
					this.map.removeLayer(this.projLocationMarker);
				}
			}
			this.updateExtent(aoiModel);
		},

		updateExtent : function(aoiModel) {
			var bbox = aoiModel.getBoundingBox();
			if (bbox) {
				this.map.fitBounds(LUtils.getLatLngBounds(bbox));
			}
		},

		updateUploadFeatureLayer : function(model, featureName) {
			if (this.uploadFeatureLayer) {
				this.map.removeLayer(this.uploadFeatureLayer);
			}
			if (featureName) {
				this.uploadFeatureLayer = L.tileLayer.wms(module.config().uploadGeoserverUrl + '/upload/wms', {
					layers: featureName,
					format : 'image/png',
					transparent : true,
					opacity : .5
				});
				this.uploadFeatureLayer.addTo(this.map).bringToFront();
			}
		},

		setupDatasetListeners : function(model, datasetCollections) {
			this.updateAllSiteMarkers();

			this.listenTo(model, 'change:startDate', this.updateAllSiteMarkers);
			this.listenTo(model, 'change:endDate', this.updateAllSiteMarkers);

			this.listenTo(datasetCollections[Config.NWIS_DATASET], 'reset', this.updateNWISMarker);
			this.listenTo(datasetCollections[Config.PRECIP_DATASET], 'reset', this.updatePrecipGridPoints);
			this.listenTo(datasetCollections[Config.ACIS_DATASET], 'reset', this.updateACISMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_ERIE], 'reset', this.updateGLCFSErieMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_HURON], 'reset', this.updateGLCFSHuronMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_MICHIGAN], 'reset', this.updateGLCFSMichiganMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_ONTARIO], 'reset', this.updateGLCFSOntarioMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_SUPERIOR], 'reset', this.updateGLCFSSuperiorMarker);

			this.listenTo(datasetCollections[Config.NWIS_DATASET], 'dataset:updateVariablesInFilter', this.updateNWISMarker);
			this.listenTo(datasetCollections[Config.PRECIP_DATASET], 'dataset:updateVariablesInFilter', this.updatePrecipGridPoints);
			this.listenTo(datasetCollections[Config.ACIS_DATASET], 'dataset:updateVariablesInFilter', this.updateACISMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_ERIE], 'dataset:updateVariablesInFilter', this.updateGLCFSErieMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_HURON], 'dataset:updateVariablesInFilter', this.updateGLCFSHuronMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_MICHIGAN], 'dataset:updateVariablesInFilter', this.updateGLCFSMichiganMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_ONTARIO], 'dataset:updateVariablesInFilter', this.updateGLCFSOntarioMarker);
			this.listenTo(datasetCollections[Config.GLCFS_DATASET_SUPERIOR], 'dataset:updateVariablesInFilter', this.updateGLCFSSuperiorMarker);
		},

		updateSiteMarkerLayer : function(datasetKind) {
			var self = this;
			var $mapDiv = this.$('#' + self.mapDivId);

			var siteCollection = this.model.get('datasetCollections')[datasetKind];
			var filteredSiteModels = siteCollection.getSiteModelsWithinDateFilter(this.model.get('startDate'), this.model.get('endDate'));
			var step = self.model.get('step');
			var isInChooseDataBySiteWorkflow = (step === Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP) || (step === Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);

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
				var bounds = LUtils.getLatLngBounds(self.model.get('aoi').getBoundingBox());
				var	projectLocation = bounds.getCenter();

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

			if (isInChooseDataBySiteWorkflow) {
				filteredSiteModels = siteCollection.getSiteModelsWithinDateFilter(this.model.get('startDate'), this.model.get('endDate'));
			}
			else {
				filteredSiteModels = siteCollection.getSitesWithVariableInFilters(variableDatasetMapping.getFilters(datasetKind, this.model.get('variables')));
			}
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
				if (isInChooseDataBySiteWorkflow) {
					marker.on('click', function(ev) {
						moveCircleMarker(latLng);
						updateDataView(siteModel, latLng);
						self.model.set('step', Config.CHOOSE_DATA_BY_SITE_VARIABLES_STEP);
					});
				}
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
		},

		updateGLCFSErieMarker : function() {
			this.updateSiteMarkerLayer(Config.GLCFS_DATASET_ERIE);
		},

		updateGLCFSHuronMarker : function() {
			this.updateSiteMarkerLayer(Config.GLCFS_DATASET_HURON);
		},

		updateGLCFSMichiganMarker : function() {
			this.updateSiteMarkerLayer(Config.GLCFS_DATASET_MICHIGAN);
		},

		updateGLCFSOntarioMarker : function() {
			this.updateSiteMarkerLayer(Config.GLCFS_DATASET_ONTARIO);
		},

		updateGLCFSSuperiorMarker : function() {
			this.updateSiteMarkerLayer(Config.GLCFS_DATASET_SUPERIOR);
		}
	});

	return view;
});
