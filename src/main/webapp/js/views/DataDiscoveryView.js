/* jslint browser: true */

define([
	'loglevel',
	'underscore',
	'views/BaseView',
	'views/NavView',
	'views/AlertView',
	'views/MapView',
	'views/LocationView',
	'models/SiteModel',
	'models/PrecipitationCollection',
	'hbs!hb_templates/dataDiscovery'
], function (log, _, BaseView, NavView, AlertView, MapView, LocationView, SiteModel, PrecipitationCollection, hbTemplate) {
	"use strict";

	var NAVVIEW_SELECTOR = '.workflow-nav';
	var LOCATION_SELECTOR = '.location-panel';
	var MAPVIEW_SELECTOR = '.map-container-div';
	var ALERTVIEW_SELECTOR = '.alert-container';
	var LOADING_SELECTOR = '.loading-indicator';

	var DATATYPE_NWIS = 'NWIS';
	var DATATYPE_PRECIP = 'PRECIP';
	var DATASETS = [DATATYPE_NWIS, DATATYPE_PRECIP];

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

			BaseView.prototype.initialize.apply(this, arguments);
			this.$(LOADING_SELECTOR).hide();

			this.navView = new NavView({
				el : this.$(NAVVIEW_SELECTOR),
				model : this.model,
				router : this.router
			});

			this.alertView = new AlertView({
				el : this.$(ALERTVIEW_SELECTOR)
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

			this.listenTo(this.model, 'change:location', this.updateDatasetModels);
			this.listenTo(this.model, 'change:radius', this.updateDatasetModels);
		},

		render : function() {
			var step = this.model.get('step');

			BaseView.prototype.render.apply(this, arguments);
			this.alertView.setElement(this.$(ALERTVIEW_SELECTOR));
			this.updateDatasetModels();

			this.navView.setElement(this.$(NAVVIEW_SELECTOR)).render();
			if ((this.model.PROJ_LOC_STEP === step) || (this.model.CHOOSE_DATA_STEP === step)) {
				this.locationView.setElement(this.$(LOCATION_SELECTOR)).render();
				this.mapView.setElement(this.$(MAPVIEW_SELECTOR)).render();
			}
			return this;
		},

		remove: function () {
			this.navView.remove();
			this.alertView.remove();
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
			var $loadingIndicator = this.$(LOADING_SELECTOR);
			var boundingBox = this.model.getBoundingBox();
			var chosenDatasets = this.model.get('datasets');
			var fetchDonePromises = [];
			var fetchErrors = [];

			if (boundingBox) {
				if (chosenDatasets.length > 0) {
					$loadingIndicator.show();
				}
				_.each(DATASETS, function(datasetType) {
					var datasetModel = self.datasetModels[datasetType];

					if (_.contains(chosenDatasets, datasetType)) {
						var donePromise = $.Deferred();
						fetchDonePromises.push(donePromise);

						datasetModel.fetch(boundingBox)
							.done(function() {
								log.debug('Successfully fetched data of type ' + datasetType);
							})
							.fail(function() {
								log.debug('Unable to retrieve ' + datasetType);
								fetchErrors.push(datasetType);
							})
							.always(function() {
								donePromise.resolve();
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

				$.when.apply(this, fetchDonePromises).done(function() {
					$loadingIndicator.hide();
					if (fetchErrors.length === 0) {
						self.alertView.showSuccessAlert('Successfully fetch data of type(s): ' + chosenDatasets.join(', '));
					}
					else {
						self.alertView.showDangerAlert('Unable to fetch the following data types: ' + fetchErrors.join(', '));
					}
				});
			}
		}
	});

	return view;
});
