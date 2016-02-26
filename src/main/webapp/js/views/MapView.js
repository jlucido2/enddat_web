/* jslint browser: true */

define([
	'underscore',
	'leaflet',
	'leaflet-providers',
	'views/BaseView'
], function(_, L, leafletProviders, BaseView) {
	var view = BaseView.extend({

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.mapDivId = options.mapDivId;

			this.baseLayers = {
				'World Physical': L.tileLayer.provider('Esri.WorldPhysical'),
				'World Imagery' : L.tileLayer.provider('Esri.WorldImagery'),
				'World Street' : L.tileLayer.provider('Esri.WorldStreetMap')
			};
			this.controls = [
				L.control.layers(this.baseLayers, {})
			];
		},

		render : function() {
			this.map = L.map(this.mapDivId, {
				center: [41.0, -100.0],
				zoom : 4,
				layers : _.values(this.baseLayers)
			});
			_.each(this.controls, function(control) {
				this.map.addControl(control);
			}, this);

			return this;
		},

		remove : function() {
			this.map.remove();
		}
	});

	return view;
});


