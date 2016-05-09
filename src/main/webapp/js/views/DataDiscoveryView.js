/* jslint browser: true */

define([
	'underscore',
	'Config',
	'utils/jqueryUtils',
	'views/BaseView',
	'views/NavView',
	'views/AlertView',
	'views/MapView',
	'views/LocationView',
	'views/ChooseView',
	'views/VariableSummaryView',
	'hbs!hb_templates/dataDiscovery'
], function (_, Config, $utils, BaseView, NavView, AlertView, MapView, LocationView, ChooseView, VariableSummaryView, hbTemplate) {
	"use strict";

	var NAVVIEW_SELECTOR = '.workflow-nav';
	var LOCATION_SELECTOR = '.location-panel';
	var CHOOSE_SELECTOR = '.choose-panel';
	var MAPVIEW_SELECTOR = '.map-container-div';
	var VARIABLE_SUMMARY_SELECTOR = '.variable-summary-container';
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
			this.listenTo(this.model, 'change:startDate', this.showSuccessfulFetchAlert);
			this.listenTo(this.model, 'change:endDate', this.showSuccessfulFetchAlert);
			this.listenTo(this.model, 'change:step', this.updateSubViews);
			this.listenTo(this.model, 'change:datasets', this.closeAlert);

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
			if (this.variableSummaryView) {
				this.variableSummaryView.remove();
			}
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		/*
		 * Model event handlers
		 */

		updateSubViews : function(model, step) {
			var prevStep = model.previous('step');

			this.alertView.closeAlert();
			switch(step) {
				case Config.PROJ_LOC_STEP:
					if (!this.locationView) {
						this.locationView = new LocationView({
							el : $utils.createDivInContainer(this.$(LOCATION_SELECTOR)),
							model : model,
							opened : true
						});
						this.locationView.render();
					}
					if (!this.mapView) {
						this.mapView = new MapView({
							el : $utils.createDivInContainer(this.$(MAPVIEW_SELECTOR)),
							mapDivId : 'map-div',
							model : model
						});
						this.mapView.render();
					}

					if (this.chooseView) {
						this.chooseView.remove();
						this.chooseView = undefined;
					}
					if (this.variableSummaryView) {
						this.variableSummaryView.remove();
						this.variableSummaryView = undefined;
					}
					break;

				case Config.CHOOSE_DATA_FILTERS_STEP:
					if (!this.locationView) {
						this.locationView = new LocationView({
							el : $utils.createDivInContainer(this.$(LOCATION_SELECTOR)),
							model : model,
							opened : true
						});
						this.locationView.render();
					}
					if (!this.mapView) {
						this.mapView = new MapView({
							el : $utils.createDivInContainer(this.$(MAPVIEW_SELECTOR)),
							mapDivId : 'map-div',
							model : model
						});
						this.mapView.render();
					}
					if (!this.chooseView) {
						this.chooseView = new ChooseView({
							el : $utils.createDivInContainer(this.$(CHOOSE_SELECTOR)),
							model : model,
							opened : true
						});
						this.chooseView.render();
					}
					if (!this.variableSummaryView) {
						this.variableSummaryView = new VariableSummaryView({
							el : $utils.createDivInContainer(this.$(VARIABLE_SUMMARY_SELECTOR)),
							model : model,
							opened : true
						});
						this.variableSummaryView.render();
					}
					break;

				case Config.CHOOSE_DATA_VARIABLES_STEP:
					if (prevStep === Config.CHOOSE_DATA_FILTERS_STEP) {
						this.locationView.collapse();
						this.chooseView.collapse();
					}

			}
		},

		showLoadingIndicator : function() {
			this.$(LOADING_SELECTOR).show();
		},

		_filterMsg : function() {
			var state = this.model.attributes;
			var latitude = (_.has(state, 'location') && _.has(state.location, 'latitude')) ? state.location.latitude : '';
			var longitude = (_.has(state, 'location') && _.has(state.location, 'longitude')) ? state.location.longitude : '';

			var radius = (state.radius) ? state.radius : '';
			var startDate = (state.startDate) ? state.startDate.format(Config.DATE_FORMAT) : '';
			var endDate = (state.endDate) ? state.endDate.format(Config.DATE_FORMAT) : '';
			var chosenDatasets = (state.datasets) ? state.datasets : [];

			var dateFilterMsg = (startDate && endDate) ? 'date filter from ' + startDate + ' to ' + endDate : 'no date filter';

			return 'Successfully fetched data of type(s): ' + chosenDatasets.join(', ') +
				' at location ' + latitude + ' ' + longitude +
				', radius ' + radius + ' mi and ' + dateFilterMsg;
		},

		showSuccessfulFetchAlert : function() {
			this.alertView.showSuccessAlert(this._filterMsg());
		},

		hideLoadingIndicator : function(fetchErrorTypes) {
			this.$(LOADING_SELECTOR).hide();
			if (fetchErrorTypes.length === 0) {
				this.showSuccessfulFetchAlert();
			}
			else {
				this.alertView.showDangerAlert('Unable to fetch the following data types: ' + fetchErrorTypes.join(', '));
			}
		},

		closeAlert : function() {
			if (null === this.model.get('datasets')) {
				this.alertView.closeAlert();
			}
		}
	});

	return view;
});
