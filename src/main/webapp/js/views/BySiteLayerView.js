/* jslint browser: true */

define([
	'underscore',
	'leaflet',
	'backbone'
], function(_, L, Backbone) {
	"use strict";
	/*
	 * This view will be rendered at initialization. A call to render will be a no op.
	 * @constructs
	 * @param {Object} options
	 *		@prop {Leaflet.Map} map
	 *		@prop {WorkflowStateModel} model
	 *		@prop {Jquery element} el - This is the parent div of the div which contains the map
	 *		@prop {String} datasetKind - The kind of collection
	 *		@prop {L.Icon} siteIcon - The icon to be used for the collection's sites
	 *		@prop {Function} getTitle - To be used when hovering over a site
	 *			@param {Backbone.Model - represents a model in collection} model
	 *			@returns String
	 */
	var view = Backbone.View.extend({

		initialize : function(options) {
			Backbone.View.prototype.initialize.apply(this, arguments);
			this.collection = this.model.get('datasetCollections')[options.datasetKind];
			this.datasetKind = options.datasetKind;
			this.map = options.map;
			this.siteIcon = options.siteIcon;
			this.getTitle = options.getTitle;

			this.siteLayerGroup = L.layerGroup();
			this.map.addLayer(this.siteLayerGroup);

			this.listenTo(this.model, 'change:dataDateFilter', this.updateSiteMarkers);
			this.listenTo(this.collection, 'reset', this.updateSiteMarkers);
			this.updateSiteMarkers();
		},

		remove : function() {
			this.siteLayerGroup.clearLayers();
			this.map.removeLayer(this.siteLayerGroup);
			return this;
		},

		updateSiteMarkers : function() {
			var self = this;
			var dateFilter = this.model.has('dataDateFilter') ? this.model.get('dataDateFilter') : undefined;
			var filteredSiteModels = this.collection.getSiteModelsWithinDateFilter(dateFilter);
			var selectedSite = (this.model.has('selectedSite')) ? this.model.get('selectedSite') : undefined;

			if ((selectedSite) &&
				(this.datasetKind === selectedSite.datasetKind) &&
				!_.contains(filteredSiteModels, selectedSite.siteModel)) {
				this.model.unset('selectedSite');
			}

			this.siteLayerGroup.clearLayers();
			_.each(filteredSiteModels, function(siteModel) {
				var latLng = L.latLng(siteModel.attributes.lat, siteModel.attributes.lon);
				var marker = L.marker(latLng, {
					icon : self.siteIcon,
					title : self.getTitle(siteModel)
				});

				self.siteLayerGroup.addLayer(marker);
				marker.on('click', function(ev) {
					self.model.set('selectedSite', {
						siteModel : siteModel,
						datasetKind : self.datasetKind
					});
				});
			});
		}
	});

	return view;
});


