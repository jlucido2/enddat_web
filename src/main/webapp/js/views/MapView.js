/* jslint browser: true */

define([
	'underscore',
	'leaflet',
	'leaflet-providers',
	'loglevel',
	'views/BaseView'
], function(_, L, leafletProviders, log, BaseView) {
	var view = BaseView.extend({

		/*
		 * @param {Object} options
		 *		@prop {Jquery element or selector} el
		 *		@prop {String} mapDivId - id of the div where the map should be rendered
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

			this.listenTo(this.model, 'change:location', this.updateMarker);
		},

		render : function() {
			// We don't call the prototype render at all because we are not rendering
			// a handlebars template, but rather rendering a leaflet map.
			this.map = L.map(this.mapDivId, {
				center: [41.0, -100.0],
				zoom : 4,
				layers : [this.baseLayers['World Street']]
			});
			_.each(this.controls, function(control) {
				this.map.addControl(control);
			}, this);

			this.setUpSingleClickHandlerToCreateMarker();


			return this;
		},

		remove : function() {
			if (_.has(this, 'map')) {
				this.map.remove();
			}
			BaseView.prototype.remove.apply(this, arguments);
		},

		setUpSingleClickHandlerToCreateMarker : function() {
			var self = this;

			var clickTimeout;
			var clickHandler = function(ev) {
				var clickToCreateMarker = function() {
					self.projLocationMarker = L.marker(ev.latlng, {
						draggable : true,
						title : 'Project Location'
					});
					self.projLocationMarker.on('dragend', function() {
						var latlng = self.projLocationMarker.getLatLng();
						self.model.set({
							location : {
								latitude : latlng.lat,
								longitude : latlng.lng
							}
						});
					});
					self.map.addLayer(self.projLocationMarker);
					self.model.set({
						location : {
							latitude : ev.latlng.lat,
							longitude : ev.latlng.lng
						}
					});

					self.map.off('click', clickHandler);
					self.map.off('dblclick', doubleClickHandler);
				};

				if (!clickTimeout) {
					clickTimeout = setTimeout(clickToCreateMarker, 500);
				}
			};
			var doubleClickHandler = function() {
				if (clickTimeout) {
					clearTimeout(clickTimeout);
					clickTimeout = null;
				}
			};

			this.map.on('click', clickHandler);
			this.map.on('dblclick', doubleClickHandler);
		},

		/*
		 * Model event handlers
		 */

		updateMarker : function(model, location) {
			this.projLocationMarker.setLatLng([location.latitude, location.longitude]);
			log.debug('Project Location has been updated to ' + '[' + location.latitude + ', ' + location.longitude + ']');
		}
	});

	return view;
});


