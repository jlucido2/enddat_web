/* jslint browser : true */

define([
	'underscore',
	'bootstrap', // Needed by the bootstrap navbar and modal
	'loglevel',
	'Config',
	'views/BaseView',
	'hbs!hb_templates/workflowNav'
], function(_, bootstrap, log, Config, BaseView, hb_template) {
	"use strict";

	var view = BaseView.extend({
		template : hb_template,

		events : {
			'click .nav-specify-aoi a' : 'showWarning',
			'click .nav-choose-data a' : 'goToChooseDataStep',
			'click .nav-process-data a' : 'goToProcessDataStep',
			'click .nav-warning-modal .ok-button' : 'goToProjectLocationStep'
		},

		/*
		 * @param {Object} options
		 *		@prop {Jquery element or selector string} el
		 *		@prop {WorkflowStateModel} model
		 *		@prop {Backbone.Router} router
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.navSelector = {};
			this.navSelector[Config.SPECIFY_AOI_STEP] = '.nav-specify-aoi';
			this.navSelector[Config.CHOOSE_DATA_FILTERS_STEP] = '.nav-choose-data';
			this.navSelector[Config.CHOOSE_DATA_VARIABLES_STEP] = '.nav-choose-data';
			this.navSelector[Config.PROCESS_DATA_STEP] = '.nav-process-data';

			this.listenTo(this.model, 'change', this.updateNavigation);
			this.listenTo(this.model.get('aoi'), 'change', this.updateAOI);
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this.$('.nav-warning-modal').modal({show : false});
			this.updateNavigation(this.model, true);
			return this;
		},

		/*
		 * DOM Event handlers
		 */
		showWarning : function(ev) {
			ev.preventDefault();
			if (this.model.get('step') !== Config.SPECIFY_AOI_STEP) {
				this.$('.nav-warning-modal').modal('show');
			}
		},

		goToProjectLocationStep : function(ev) {
			ev.preventDefault();
			if (this.model.get('step') !== Config.SPECIFY_AOI_STEP) {
				this.model.set('step', Config.SPECIFY_AOI_STEP);
				this.$('.nav-warning-modal').modal('hide');
			}
		},
		goToChooseDataStep : function(ev) {
			var step = this.model.get('step');
			ev.preventDefault();
			if ((step !== Config.CHOOSE_DATA_FILTERS_STEP) && (step !== Config.CHOOSE_DATA_VARIABLES_STEP)) {
				this.model.set('step', Config.CHOOSE_DATA_FILTERS_STEP);
			}
		},
		goToProcessDataStep : function(ev) {
			ev.preventDefault();
			if (this.model.get('step') !== Config.PROCESS_DATA_STEP) {
				this.model.set({step : Config.PROCESS_DATA_STEP});
			}
		},

		_getChooseDataUrl : function(model) {
			var state = model.attributes;
			var aoi = model.attributes.aoi;

			var startDate = (state.startDate) ? '/startdate/' + state.startDate.format(Config.DATE_FORMAT_URL) : '';
			var endDate = (state.endDate) ? '/enddate/' + state.endDate.format(Config.DATE_FORMAT_URL) : '';
			var datasets = (state.datasets) ? '/dataset/' + state.datasets.join('/') : '';

			var aoiFragment = '';
			if (aoi.usingProjectLocation()) {
				var latitude = (aoi.attributes.latitude) ? aoi.attributes.latitude : '';
				var longitude = (aoi.attributes.longitude) ? aoi.attributes.longitude : '';
				var radius = (aoi.attributes.radius) ? aoi.attributes.radius : '';
				aoiFragment = 'lat/' + latitude + '/lng/' + longitude + '/radius/' + radius;
			}
			else if (aoi.usingAOIBox()) {
				//TODO ADD aoiFragment for AOI Box
				aoiFragment = '';
			}

			return aoiFragment + startDate + endDate + datasets;
		},

		updateNavigation : function(model, isRendering) {
			var stepHasChanged = isRendering ? true : model.hasChanged('step');
			var newStep = model.get('step');

			var $chooseDataBtn = this.$(this.navSelector[Config.CHOOSE_DATA_FILTERS_STEP]);
			var $processDataBtn= this.$(this.navSelector[Config.PROCESS_DATA_STEP]);
			var currentStepSelector;

			if (stepHasChanged) {
				currentStepSelector = this.navSelector[newStep] + ' a';
				this.$('.navbar-nav li a').not(currentStepSelector).removeClass('active');
				this.$(currentStepSelector).addClass('active');
			}
			switch(newStep) {
				case Config.SPECIFY_AOI_STEP:
					if (model.get('aoi').hasValidAOI()) {
						$chooseDataBtn.removeClass('disabled');
					}
					else {
						$chooseDataBtn.addClass('disabled');
					}
					$processDataBtn.addClass('disabled');

					this.router.navigate('');
					break;

				case Config.CHOOSE_DATA_FILTERS_STEP:
				case Config.CHOOSE_DATA_VARIABLES_STEP:
					if (model.get('hasSelectedVariables')) {
						$processDataBtn.removeClass('disabled');
					}
					else {
						$processDataBtn.addClass('disabled');
					}

					this.router.navigate(this._getChooseDataUrl(model));
					break;

				case Config.PROCESS_DATA_STEP:
					break;
			}
		},

		updateAOI : function() {
			var $chooseDataBtn = this.$(this.navSelector[Config.CHOOSE_DATA_FILTERS_STEP]);

			if (this.model.get('step') === Config.SPECIFY_AOI_STEP) {
				if (this.model.get('aoi').hasValidAOI()) {
						$chooseDataBtn.removeClass('disabled');
				}
				else {
					$chooseDataBtn.addClass('disabled');
				}
			}
		}

	});

	return view;
});


