/* jslint browser: true */

define([
	'loglevel',
	'underscore',
	'views/BaseView',
	'views/NavView',
	'views/MapView',
	'views/LocationView',
	'models/SiteModel',
	'models/PrecipitationCollection',
	'hbs!hb_templates/dataDiscovery'
], function (log, _, BaseView, NavView, MapView, LocationView, SiteModel, PrecipitationCollection, hbTemplate) {
	"use strict";

	var NAVVIEW_SELECTOR = '.workflow-nav';
	var LOCATION_SELECTOR = '.location-panel';
	var MAPVIEW_SELECTOR = '.map-container-div';
	var DATATYPE_NWIS = 'NWIS';
	var DATATYPE_PRECIP = 'PRECIP';
	var DATASETS = [DATATYPE_NWIS, DATATYPE_PRECIP];
	var FETCH_WARN_MSG = _.object(DATASETS, [
		'Unable to retrieve NWIS sites',
		'Unable to retrieve precipitation grid points'
	]);

	var view = BaseView.extend({
		template: hbTemplate,

		/*
		 * @constructs
		 * @param {Object} options
		 *		@prop {Jquery element} el
		 *		@prop {models/WorkflowStateModel} model
		 */
		initialize: function (options) {
			this.datasetModels = {};
			this.datasetModels[DATATYPE_NWIS] = new SiteModel();
			this.datasetModels[DATATYPE_PRECIP] = new PrecipitationCollection();
			this.updateDatasetModels();

			this.listenTo(this.model, 'change:location', this.updateDatasetModels);
			this.listenTo(this.model, 'change:radius', this.updateDatasetModels);

			BaseView.prototype.initialize.apply(this, arguments);

			this.navView = new NavView({
				el : this.$(NAVVIEW_SELECTOR),
				model : this.model,
				router : this.router
			});

			this.mapView = new MapView({
				el : this.$(MAPVIEW_SELECTOR),
				mapDivId : 'map-div',
				model : this.model,
				datasetModels : this.datasetModels
			});

			this.locationView  = new LocationView({
				el : this.$(LOCATION_SELECTOR),
				model : this.model,
				opened : true
			});
		},

		render : function() {
			var step = this.model.get('step');

			BaseView.prototype.render.apply(this, arguments);
			this.navView.setElement(this.$(NAVVIEW_SELECTOR)).render();
			if ((this.model.PROJ_LOC_STEP === step) || (this.model.CHOOSE_DATA_STEP === step)) {
				this.locationView.setElement(this.$(LOCATION_SELECTOR)).render();
				this.mapView.setElement(this.$(MAPVIEW_SELECTOR)).render();
			}
			return this;
		},

		remove: function () {
			this.navView.remove();
			this.mapView.remove();
			this.locationView.remove();
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		/*
		 *
		 */
		updateDatasetModels: function () {
			var self = this;
			var boundingBox = this.model.getBoundingBox();
			var datasets = this.model.get('datasets');
			if (boundingBox) {
				_.each(DATASETS, function(datasetType) {
					var datasetModel = self.datasetModels[datasetType];

					if (_.contains(datasets, datasetType)) {
						datasetModel.fetch(boundingBox)
							.done(function() {
								log.debug('Successfully fetched data of type ' + datasetType);
							})
							.fail(function() {
								log.debug(FETCH_WARN_MSG[datasetType]);
							});
					}
					else {
						if (!datasetModel.isEmpty()) {
							if (_.has(datasetModel, 'reset')) {
								// Then must be a collection so reset
								datasetModel.reset();
							}
							else {
								datasetModel.clear();
							}
						}
					}
				});

			}
		}
	});

	return view;
});
