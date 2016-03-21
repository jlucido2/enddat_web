/* jslint browser: true */

define([
	'underscore',
	'leaflet',
	'leaflet-providers',
	'loglevel',
	'utils/geoSpatialUtils',
	'utils/mapUtils',
	'views/BaseView'
], function(_, L, leafletProviders, log, geoSpatialUtils, mapUtils, BaseView) {
	var view = BaseView.extend({

		/*
		 * @param {Object} options
		 *		@prop {Jquery element or selector} el
		 *		@prop {String} mapDivId - id of the div where the map should be rendered
		 *		@prop {WorkflowStateModel} model
		 *		@prop {SiteModel} sites
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.mapDivId = options.mapDivId;
			this.sites = options.sites;

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

			this.listenTo(this.model, 'change:location', this.updateMarker);
			this.listenTo(this.model, 'change:radius', this.updateExtent);
			this.listenTo(this.sites, 'sync', this.updateSiteMarker);
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

			this.updateMarker(this.model, this.model.get('location'));
			this.updateExtent(this.model, this.model.get('radius'));
			this.updateSiteMarker(this.sites);
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
					self.map.addLayer(self.projLocationMarker);
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
		updateMarker : function(model, location) {
			var mapHasMarker = this.map.hasLayer(this.projLocationMarker);
			if (_.has(location, 'latitude') && (location.latitude) && _.has(location, 'longitude') && (location.longitude)) {
				if (!mapHasMarker) {
					this.map.addLayer(this.projLocationMarker);
				}
				this.projLocationMarker.setLatLng([location.latitude, location.longitude]);
				this.removeSingleClickHandler();
				log.debug('Project Location has been updated to ' + '[' + location.latitude + ', ' + location.longitude + ']');
			}
			else {
				if (mapHasMarker) {
					this.map.removeLayer(this.projLocationMarker);
				}
				this.setUpSingleClickHandlerToCreateMarker();
			}
		},

		updateExtent : function(model, radius) {
			if (radius) {
				var location = model.get('location');
				var bbox = geoSpatialUtils.getBoundingBox(location.latitude, location.longitude, radius);

				var southwest = L.latLng(bbox.south, bbox.west);
				var northeast = L.latLng(bbox.north, bbox.east);


				this.map.fitBounds(L.latLngBounds(southwest, northeast));
			}
		},

		/*
		 * Updates or adds a marker for each site
		 * @param {SiteModel} sites - has one or more site objects, each with properties
		 *	latitude and longitude in order to be a valid location
		 */
		updateSiteMarker : function(sites) {
			var self = this;
			var siteObjects = sites.get('sites');
			var siteIcon = mapUtils.createIcon("img/time-series.png");
			var mapHasSiteMarker = this.map.hasLayer(this.siteLayerGroup);
			if (mapHasSiteMarker) {
				this.map.removeLayer(this.siteLayerGroup);
			}
			this.siteLayerGroup = L.layerGroup();
			if(!_.isEmpty(siteObjects)) {
				_.each(siteObjects, function(el) {
					var marker = L.marker([el['lat'], el['lon']], {icon: siteIcon, title: el['name']});
					self.siteLayerGroup.addLayer(marker);
				});
				this.siteLayerGroup.addTo(this.map);				
			}
		}
	});

	return view;
});

