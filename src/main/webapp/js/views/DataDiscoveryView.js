/* jslint browser: true */
/* global parseFloat */

define([
	'underscore',
	'Config',
	'utils/jqueryUtils',
	'views/BaseView',
	'views/NavView',
	'views/AlertView',
	'views/MapView',
	'views/LocationView',
	'views/AOIBoxView',
	'views/ChooseView',
	'views/VariableSummaryView',
	'views/ProcessDataView',
	'hbs!hb_templates/dataDiscovery'
], function (_, Config, $utils, BaseView, NavView, AlertView, MapView, LocationView, AOIBoxView, ChooseView,
		VariableSummaryView, ProcessDataView, hbTemplate) {
	"use strict";

	var DEFAULT_RADIUS = 2;

	var NAVVIEW_SELECTOR = '.workflow-nav';
	var LOCATION_SELECTOR = '.location-panel';
	var CHOOSE_SELECTOR = '.choose-panel';
	var MAPVIEW_SELECTOR = '.map-container-div';
	var VARIABLE_SUMMARY_SELECTOR = '.variable-summary-container';
	var PROCESS_DATA_SELECTOR = '.process-data-container';
	var ALERTVIEW_SELECTOR = '.alert-container';
	var LOADING_SELECTOR = '.loading-indicator';

	var removeSubView = function(view) {
		if (view) {
			view.remove();
		}
		return undefined;
	};

	var view = BaseView.extend({
		template: hbTemplate,

		events : {
			'change .workflow-start-container select' : 'selectAOIDefinition'
		},

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
			if (this.aoiView) {
				this.aoiView.remove();
			}
			if (this.chooseView) {
				this.chooseView.remove();
			}
			if (this.variableSummaryView) {
				this.variableSummaryView.remove();
			}
			if (this.processDataView) {
				this.processDataView.remove();
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
				case Config.SPECIFY_AOI_STEP:
					this.$('.workflow-start-container select').val('');
					this.$('.workflow-start-container').addClass('in');
					this.aoiView = removeSubView(this.aoiView);
					this.mapView = removeSubView(this.mapView);
					this.chooseView = removeSubView(this.chooseView);
					this.variableSummaryView = removeSubView(this.variableSummaryView);
					this.processDataView = removeSubView(this.processDataView);

					break;

				case Config.CHOOSE_DATA_FILTERS_STEP:
					var aoiModel = this.model.get('aoi');
					if (!this.aoiView) {
						if (aoiModel.usingProjectLocation()) {
							this.aoiView = new LocationView({
								el : $utils.createDivInContainer(this.$(LOCATION_SELECTOR)),
								model : model.get('aoi'),
								opened : true
							});
						}
						else if (aoiModel.usingAOIBox()) {
							this.aoiView = new AOIBoxView({
								el : $utils.createDivInContainer(this.$(LOCATION_SELECTOR)),
								model : model.get('aoi'),
								opened : true
							});
						}
						this.aoiView.render();
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
					this.processDataView = removeSubView(this.processDataView);

					this.variableSummaryView.expand();

					break;

				case Config.CHOOSE_DATA_VARIABLES_STEP:
					// You can only get to this step from CHOOSE_DATA_FILTER_STEP
					if (prevStep === Config.CHOOSE_DATA_FILTERS_STEP) {
						if (this.location)
						this.aoiView.collapse();
						this.chooseView.collapse();
					}
					break;

				case Config.PROCESS_DATA_STEP:
					if (!this.processDataView) {
						this.processDataView = new ProcessDataView({
							el : $utils.createDivInContainer(this.$(PROCESS_DATA_SELECTOR)),
							model : model,
							opened : true
						});
						this.processDataView.render();
					}
					if (!this.variableSummaryView) {
						this.variableSummaryView = new VariableSummaryView({
							el : $utils.createDivInContainer(this.$(VARIABLE_SUMMARY_SELECTOR)),
							model : model,
							opened : false
						});
					}
					else {
						this.variableSummaryView.collapse();
					}

					this.aoiView = removeSubView(this.locationView);
					this.chooseView = removeSubView(this.chooseView);
					this.mapView = removeSubView(this.mapView);
			}
		},

		showLoadingIndicator : function() {
			this.$(LOADING_SELECTOR).show();
		},

		_filterMsg : function() {
			var state = this.model.attributes;
			var aoi = state.aoi;

			var startDate = (state.startDate) ? state.startDate.format(Config.DATE_FORMAT) : '';
			var endDate = (state.endDate) ? state.endDate.format(Config.DATE_FORMAT) : '';
			var dateFilterMsg = (startDate && endDate) ? 'date filter from ' + startDate + ' to ' + endDate : 'no date filter';

			var chosenDatasets = (state.datasets) ? state.datasets : [];

			var aoiFragment = '';
			if (aoi.usingProjectLocation()) {
				var latitude = (aoi.attributes.latitude) ? parseFloat(aoi.attributes.latitude) : '';
				var longitude = (aoi.attributes.longitude) ? parseFloat(aoi.attributes.longitude) : '';
				var radius = (aoi.attributes.radius) ? aoi.attributes.radius : '';

				aoiFragment = ' at location ' + latitude + ' ' + longitude + ', radius ' + radius + ' mi';
			}
			else if (aoi.usingAOIBox()) {
				var aoiBox = aoi.attributes.aoiBox;
				aoiFragment = ' within bbox ' + aoiBox.south + ', ' + aoiBox.west + ', ' + aoiBox.north + ', ' + aoiBox.east;
			}

			return 'Successfully fetched data of type(s): ' + chosenDatasets.join(', ') +
				aoiFragment + ' and ' + dateFilterMsg;
		},

		showSuccessfulFetchAlert : function() {
			var step = this.model.get('step');
			if ((step === Config.CHOOSE_DATA_FILTERS_STEP) ||
				(step === Config.CHOOSE_DATA_VARIABLES_STEP)) {
				this.alertView.showSuccessAlert(this._filterMsg());
			}
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
		},

		/*
		 * DOM Event Handlers
		 */

		selectAOIDefinition : function(ev) {
			var kind = $(ev.currentTarget).val();
			var aoiModel = this.model.get('aoi');
			this.$('.workflow-start-container').removeClass('in');
			switch(kind) {
				case 'location':
					aoiModel.set({
						latitude : '',
						longitude : '',
						radius : DEFAULT_RADIUS
					});
					if (!this.aoiView) {
						this.aoiView = new LocationView({
							el : $utils.createDivInContainer(this.$(LOCATION_SELECTOR)),
							model : this.model.get('aoi'),
							opened : true
						});
						this.aoiView.render();
					}
					else {
						this.aoiView.expand();
					}
					break;

				case 'aoiBox':
					aoiModel.set({
						aoiBox : {}
					});
					if (!this.aoiView) {
						this.aoiView = new AOIBoxView({
							el : $utils.createDivInContainer(this.$(LOCATION_SELECTOR)),
							model : this.model.get('aoi'),
							opened : true
						});
						this.aoiView.render();
					}
					else {
						this.aoiView.expand();
					}
					break;
			}

			if (!this.mapView) {
				this.mapView = new MapView({
					el : $utils.createDivInContainer(this.$(MAPVIEW_SELECTOR)),
					mapDivId : 'map-div',
					model : this.model
				});
				this.mapView.render();
			}
		}
	});

	return view;
});
