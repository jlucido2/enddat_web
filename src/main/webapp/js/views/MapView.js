/* jslint browser: true */

define([
	'underscore',
	'leaflet',
	'leaflet-providers',
	'views/BaseView'
], function(_, L, leafletProviders, BaseView) {
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

			return this;
		},

		remove : function() {
			if (_.has(this, 'map')) {
				this.map.remove();
			}
			BaseView.prototype.remove.apply(this, arguments);
		}
	});

	return view;
});


