/* jslint browser: true */

define([
	'underscore',
	'jquery',
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
	'views/SitesLayerView',
	'hbs!hb_templates/mapOps'
], function(_, $, L, leafletDraw, leafletProviders, log, module, Config, variableDatasetMapping, $utils, LUtils, legendControl,
		BaseView, SitesLayerView, hbTemplate) {

	L.Icon.Default.imagePath = 'bower_components/leaflet/dist/images';

	var MAP_DIV_ID = 'map-div';

	var view = BaseView.extend({

		template : hbTemplate,

		/*
		 * @param {Object} options
		 *		@prop {Jquery element or selector} el
		 *		@prop {WorkflowStateModel} model
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.baseLayers = {
				'World Street' : L.tileLayer.provider('Esri.WorldStreetMap'),
				'World Physical': L.tileLayer.provider('Esri.WorldPhysical'),
				'World Imagery' : L.tileLayer.provider('Esri.WorldImagery')
			};
			
			// add public beaches
			var publicBeachMarkerOpts = {
					radius: 4,
					fillColor: "#FFFF00",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
			};
			var publicBeachesLayer = this.addGeoJsonLayer('json/publicBeaches.json', publicBeachMarkerOpts);
			
			// add USGS model beaches
			var usgsModelBeachesMarkerOpts = {
					radius: 4,
					fillColor: "#229954",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
			};
			var usgsModelBeachesLayer = this.addGeoJsonLayer('json/usgsModelBeaches.json', usgsModelBeachesMarkerOpts);
			
			this.beachOverlays = {
				"Public Beaches": publicBeachesLayer,
				"USGS Model Beaches": usgsModelBeachesLayer
			};

			this.legendControl = legendControl({opened : false});
			this.defaultControls = [
				L.control.layers(this.baseLayers, this.beachOverlays),
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

			this.sitesLayerView = undefined;
		},

		render : function() {
			var aoiModel = this.model.get('aoi');

			BaseView.prototype.render.apply(this, arguments);

			if (_.has(this, 'map')) {
				this.map.remove();
				this.removeSitesLayerView();
			}
			this.map = L.map(MAP_DIV_ID, {
				center: [41.0, -100.0],
				zoom : 4,
				layers : [this.baseLayers['World Street'], this.beachOverlays['Public Beaches'], this.beachOverlays['USGS Model Beaches']]
			});
			
			_.each(this.defaultControls, function(control) {
				this.map.addControl(control);
			}, this);

			// Set up the map event handlers for the draw control to update the aoi model.
			this.map.on('draw:created', function(ev) {
				this.model.get('aoi').set('aoiBox', LUtils.getBbox(ev.layer.getBounds()));
			}, this);
			this.map.on('draw:edited', function(ev) {
				this.model.get('aoi').set('aoiBox', LUtils.getBbox(ev.layers.getLayers()[0].getBounds()));
			}, this);

			// Set up model event listeners and update the map state to match the current state of the workflow model.
			this.updateWorkflowStep(this.model, this.model.get('step'));
			this.listenTo(this.model, 'change:step', this.updateWorkflowStep);

			this.updateAOILayerAndExtent(aoiModel);
			this.listenTo(aoiModel, 'change', this.updateAOILayerAndExtent);

			this.updateUploadFeatureLayer(this.model, this.model.get('uploadedFeatureName'));
			this.listenTo(this.model, 'change:uploadedFeatureName', this.updateUploadFeatureLayer);

			return this;
		},

		remove : function() {
			this.removeSitesLayerView();
			if (_.has(this, 'map')) {
				this.map.remove();
			}

			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		removeSitesLayerView : function() {
			if (this.sitesLayerView) {
				this.sitesLayerView.remove();
				this.sitesLayerView = undefined;
			}
		},
		
		addGeoJsonLayer : function(dataPath, markerOptions) {
			var self = this;
			var layer = L.geoJson(null, {
				pointToLayer: function (feature, latlng) {
					return L.circleMarker(latlng, markerOptions);
					}
			});
			$.getJSON(dataPath, function(data) {
				layer.addData(data);
			});
			return layer;
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
			var $map = this.$('#' + MAP_DIV_ID);
			switch (newStep) {
				case Config.SPECIFY_AOI_STEP:
					this.removeSitesLayerView();
					break;

				case Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP:
				case Config.CHOOSE_DATA_BY_VARIABLES_STEP:
					this.legendControl.setVisibility(true);
					this.removeSitesLayerView();
					this.sitesLayerView = new SitesLayerView({
						map : this.map,
						el : this.el,
						model : model
					});
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
		}
	});

	return view;
});
