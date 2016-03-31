/* jslint browser: true */

define([
	'loglevel',
	'underscore',
	'views/BaseView',
	'views/NavView',
	'views/AlertView',
	'views/MapView',
	'views/LocationView',
	'views/ChooseView',
	'hbs!hb_templates/dataDiscovery'
], function (log, _, BaseView, NavView, AlertView, MapView, LocationView, ChooseView, hbTemplate) {
	"use strict";

	var NAVVIEW_SELECTOR = '.workflow-nav';
	var LOCATION_SELECTOR = '.location-panel';
	var CHOOSE_SELECTOR = '.choose-panel';
	var MAPVIEW_SELECTOR = '.map-container-div';
	var ALERTVIEW_SELECTOR = '.alert-container';
	var LOADING_SELECTOR = '.loading-indicator';

	var view = BaseView.extend({
		template: hbTemplate,

		/*
		 * @constructs
		 * @param {Object} options
		 *		@prop {Jquery element} el
		 *		@prop {models/WorkflowStateModel} model
		 *		@prop {Backbone.Router} router
		 */
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.navView = new NavView({
				el : this.$(NAVVIEW_SELECTOR),
				model : this.model,
				router : this.router
			});

			this.alertView = new AlertView({
				el : this.$(ALERTVIEW_SELECTOR)
			});
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this.$(LOADING_SELECTOR).hide();

			this.alertView.setElement(this.$(ALERTVIEW_SELECTOR));
			this.navView.setElement(this.$(NAVVIEW_SELECTOR)).render();
			this.updateSubViews(this.model, this.model.get('step'));

			// Set up event listeners on the workflow model
			this.listenTo(this.model, 'dataset:updateStart', this.showLoadingIndicator);
			this.listenTo(this.model, 'dataset:updateFinished', this.hideLoadingIndicator);
			this.listenTo(this.model, 'change:step', this.updateSubViews);

			return this;
		},

		remove: function () {
			this.navView.remove();
			this.alertView.remove();
			if (this.mapView) {
				this.mapView.remove();
			}
			if (this.locationView) {
				this.locationView.remove();
			}
			if (this.chooseView) {
				this.chooseView.remove();
			}
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		/*
		 * Model event handlers
		 */

		updateSubViews : function(model, step) {
			switch(step) {
				case model.PROJ_LOC_STEP:
					if (!this.locationView) {
						this.locationView = new LocationView({
							el : this.$(LOCATION_SELECTOR),
							model : model,
							opened : true
						});
						this.locationView.render();
					}
					if (!this.mapView) {
						this.mapView = new MapView({
							el : this.$(MAPVIEW_SELECTOR),
							mapDivId : 'map-div',
							model : model
						});
						this.mapView.render();
					}
					if (this.chooseView) {
						this.chooseView.remove();
						this.chooseView = undefined;
					}
					break;
				case model.CHOOSE_DATA_STEP:
					if (!this.locationView) {
						this.locationView = new LocationView({
							el : this.$(LOCATION_SELECTOR),
							model : model,
							opened : true
						});
						this.locationView.render();
					}
					if (!this.mapView) {
						this.mapView = new MapView({
							el : this.$(MAPVIEW_SELECTOR),
							mapDivId : 'map-div',
							model : model
						});
						this.mapView.render();
					}
					if (!this.chooseView) {
						this.chooseView = new ChooseView({
							el : this.$(CHOOSE_SELECTOR),
							model : model,
							opened : true
						});
						this.chooseView.render();
					}
					break;
			}
		},

		showLoadingIndicator : function() {
			this.$(LOADING_SELECTOR).show();
		},

		hideLoadingIndicator : function(fetchErrorTypes) {
			var chosenDatasets = this.model.get('datasets');

			this.$(LOADING_SELECTOR).hide();
			if (fetchErrorTypes.length === 0) {
				this.alertView.showSuccessAlert('Successfully fetch data of type(s): ' + chosenDatasets.join(', '));
			}
			else {
				this.alertView.showDangerAlert('Unable to fetch the following data types: ' + fetchErrorTypes.join(', '));
			}
			this.$(ALERTVIEW_SELECTOR).show();
		}
	});

	return view;
});
