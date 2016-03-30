/* jslint browser: true */

define([
	'underscore',
	'leaflet',
	'leaflet-providers',
	'loglevel',
	'utils/geoSpatialUtils',
	'views/BaseView'
], function(_, L, leafletProviders, log, geoSpatialUtils, BaseView) {

	var siteIcon = new L.icon({
		iconUrl : 'img/time-series.png',
		iconSize : [10, 10]
	});
	var precipIcon = L.icon({
		iconUrl : 'img/national-precipitation.png',
		iconSize : [14, 14]
	});

	var view = BaseView.extend({

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
			this.controls = [
				L.control.layers(this.baseLayers, {})
			];

			this.projLocationMarker = L.marker([0, 0], {
				draggable : true,
				title : 'Project Location'
			});
			this.projLocationMarker.on('dragend', function() {
				var latlng = this.projLocationMarker.getLatLng();
				this.model.set({
					location : {
						latitude : latlng.lat,
						longitude : latlng.lng
					}
				});
			}, this);

			this.siteLayerGroup = L.layerGroup();
			this.precipLayerGroup = L.layerGroup();
		},

		render : function() {
			// We don't call the prototype render at all because we are not rendering
			// a handlebars template, but rather rendering a leaflet map.
			if (_.has(this, 'map')) {
				this.map.remove();
			}
			this.map = L.map(this.mapDivId, {
				center: [41.0, -100.0],
				zoom : 4,
				layers : [this.baseLayers['World Street']]
			});
			_.each(this.controls, function(control) {
				this.map.addControl(control);
			}, this);
			this.map.addLayer(this.siteLayerGroup);
			this.map.addLayer(this.precipLayerGroup);

			this.updateLocationMarkerAndExtent(this.model, this.model.get('location'));
			this.updateSiteMarker(this.model.attributes.datasetModels[this.model.NWIS_DATASET]);
			this.updatePrecipGridPoints(this.model.attributes.datasetModels[this.model.PRECIP_DATASET]);

			// Wait to set up model listeners until the view has been rendered
			this.listenTo(this.model, 'change:location', this.updateLocationMarkerAndExtent);
			this.listenTo(this.model, 'change:radius', this.updateExtent);
			this.listenTo(this.model.attributes.datasetModels[this.model.NWIS_DATASET], 'sync', this.updateSiteMarker);
			this.listenTo(this.model.attributes.datasetModels[this.model.PRECIP_DATASET], 'reset', this.updatePrecipGridPoints);

			return this;
		},

		remove : function() {
			if (_.has(this, 'map')) {
				this.map.remove();
			}
			BaseView.prototype.remove.apply(this, arguments);
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
		 * Updates or adds a marker at location if location is valid and removes the single click handler
		 * to create the marker. Otherwise remove the marker and set up the single click handler so that
		 * a marker can be added.
		 * @param {WorkflowStateModel} model
		 * @param {Object} location - has properties latitude and longitude in order to be a valid location
		 */
		updateLocationMarkerAndExtent : function(model, location) {
			var mapHasMarker = this.map.hasLayer(this.projLocationMarker);
			var $tiles = this.$('.leaflet-tile');
			if (_.has(location, 'latitude') && (location.latitude) && _.has(location, 'longitude') && (location.longitude)) {
				if (!mapHasMarker) {
					this.map.addLayer(this.projLocationMarker);
				}
				this.projLocationMarker.setLatLng([location.latitude, location.longitude]);
				this.removeSingleClickHandler();
				$tiles.removeClass('leaflet-clickable');
				this.updateExtent(model, model.get('radius'));
			}
			else {
				if (mapHasMarker) {
					this.map.removeLayer(this.projLocationMarker);
				}
				$tiles.addClass('leaflet-clickable');
				this.setUpSingleClickHandlerToCreateMarker();
			}
		},

		updateExtent : function(model, radius) {
			if (radius && model.has('location')) {
				var location = model.get('location');
				if ((location.latitude) && (location.longitude)) {
					var bbox = geoSpatialUtils.getBoundingBox(location.latitude, location.longitude, radius);

					var southwest = L.latLng(bbox.south, bbox.west);
					var northeast = L.latLng(bbox.north, bbox.east);
					this.map.fitBounds(L.latLngBounds(southwest, northeast));
				}
			}
		},

		/*
		 * Updates the siteLayerGroup to reflect the sites in the model
		 * @param {SiteModel} sites - has one or more site objects, each with properties
		 *	latitude and longitude in order to be a valid location
		 */
		updateSiteMarker : function(sites) {
			var self = this;
			var siteObjects = sites.get('sites');

			this.siteLayerGroup.clearLayers();

			_.each(siteObjects, function(site) {
				var marker = L.marker([site['lat'], site['lon']], {icon: siteIcon, title: site['name']});
				self.siteLayerGroup.addLayer(marker);
			});
		},

		/*
		 * Updates the precipitation layer group to reflect the grid points in precipCollection
		 * @param {models/PrecipitationCollection} precipCollection
		 */
		updatePrecipGridPoints : function(precipCollection) {
			var self = this;
			this.precipLayerGroup.clearLayers();

			precipCollection.each(function(precipModel) {
				var marker = L.marker(
					[precipModel.attributes.lat, precipModel.attributes.lon],
					{
						icon : precipIcon,
						title : precipModel.attributes.y + ':' + precipModel.attributes.x
					}
				);
				self.precipLayerGroup.addLayer(marker);
			});
		}
	});

	return view;
});

