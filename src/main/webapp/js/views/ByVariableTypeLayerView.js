/* jslint browser: true */

define([
	'underscore',
	'jquery',
	'leaflet',
	'backbone',
	'utils/VariableDatasetMapping',
	'hbs!hb_templates/variablePopup'
], function(_, $, L, Backbone, variableDatasetMapping, variablePopupTemplate) {
	"use strict";
	/*
	 * * This view will be rendered at initialization. A call to render will be a no op.
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
	 *
	 */
	var view = Backbone.View.extend({

		initialize : function(options) {
			Backbone.View.prototype.initialize.apply(this, arguments);
			this.collection = this.model.get('datasetCollections')[options.datasetKind];
			this.datasetKind = options.datasetKind;
			this.map = options.map;
			this.siteIcon = options.siteIcon;
			this.getTitle = options.getTitle;

			// This adds the toggle event for a site's popup
			this.events = {};
			this.events['change .dataset-' + this.datasetKind + '-popup'] = this.toggleSelectedVariable;
			this.delegateEvents(this.events);

			this.siteLayerGroup = L.layerGroup();
			this.map.addLayer(this.siteLayerGroup);

			this.listenTo(this.model, 'change:dataDateFilter', this.updateSiteMarkers);
			this.listenTo(this.collection, 'reset', this.updateSiteMarkers);
			this.listenTo(this.collection, 'dataset:updateVariablesInFilter', this.updateSiteMarkers);
			this.listenTo(this.model, 'change:selectedVarKind', this.updateSiteMarkers);
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
			var selectedVarKind = (this.model.has('selectedVarKind')) ? this.model.get('selectedVarKind') : undefined;
			var selectedVarDisplayName = (selectedVarKind) ? variableDatasetMapping.getMapping()[selectedVarKind].displayName : undefined;
			var varFilters = (selectedVarKind) ? variableDatasetMapping.getFilters(this.datasetKind, [selectedVarKind]) : [];
			var filteredSiteModels = this.collection.getSitesWithVariableInFilters(varFilters, dateFilter);

			this.siteLayerGroup.clearLayers();
			_.each(filteredSiteModels, function(siteModel) {
				var latLng = L.latLng(siteModel.attributes.lat, siteModel.attributes.lon);
				var variableModel = siteModel.attributes.variables.findWhere(varFilters[0]);
				var marker = L.marker(latLng, {
					icon : self.siteIcon,
					title : self.getTitle(siteModel)
				});

				marker.bindPopup(variablePopupTemplate({
					datasetKind : self.datasetKind,
					siteNo : siteModel.get('siteNo'),
					siteId : siteModel.cid,
					variableName : selectedVarDisplayName,
					variableId : variableModel.cid,
					selected : (variableModel.has('selected') ? variableModel.get('selected') : false)
				}));

				self.siteLayerGroup.addLayer(marker);
			});
		},

		toggleSelectedVariable : function(ev) {
			var $checkbox = $(ev.target);
			var siteCid = $checkbox.data('siteid');
			var variableCid = $checkbox.data('variableid');
			var variableModel = this.collection.get(siteCid).get('variables').get(variableCid);

			variableModel.set('selected', !variableModel.get('selected'));
		}
	});

	return view;
});

