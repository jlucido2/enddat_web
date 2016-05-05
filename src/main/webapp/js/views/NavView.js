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
			'click .nav-project-loc a' : 'showWarning',
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
			this.navSelector[Config.PROJ_LOC_STEP] = '.nav-project-loc';
			this.navSelector[Config.CHOOSE_DATA_STEP] = '.nav-choose-data';
			this.navSelector[Config.PROCESS_DATA_STEP] = '.nav-process-data';

			this.listenTo(this.model, 'change', this.updateNavigation);
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
			if (this.model.get('step') !== Config.PROJ_LOC_STEP) {
				this.$('.nav-warning-modal').modal('show');
			}
		},

		goToProjectLocationStep : function(ev) {
			ev.preventDefault();
			if (this.model.get('step') !== Config.PROJ_LOC_STEP) {
				this.model.set('step', Config.PROJ_LOC_STEP);
				this.$('.nav-warning-modal').modal('hide');
			}
		},
		goToChooseDataStep : function(ev) {
			ev.preventDefault();
			if (this.model.get('step') !== Config.CHOOSE_DATA_STEP) {
				this.model.set('step', Config.CHOOSE_DATA_STEP);
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
			var latitude = (_.has(state, 'location') && _.has(state.location, 'latitude')) ? state.location.latitude : '';
			var longitude = (_.has(state, 'location') && _.has(state.location, 'longitude')) ? state.location.longitude : '';

			var location = 'lat/' + latitude + '/lng/' + longitude;
			var radius = (state.radius) ? '/radius/' + state.radius : '';
			var startDate = (state.startDate) ? '/startdate/' + state.startDate.format(Config.DATE_FORMAT_URL) : '';
			var endDate = (state.endDate) ? '/enddate/' + state.endDate.format(Config.DATE_FORMAT_URL) : '';
			var datasets = (state.datasets) ? '/dataset/' + state.datasets.join('/') : '';
			return location + radius + startDate + endDate + datasets;
		},

		updateNavigation : function(model, isRendering) {
			var stepHasChanged = isRendering ? true : model.hasChanged('step');
			var newStep = model.get('step');

			var $chooseDataBtn, $processDataBtn, currentStepSelector;

			if (stepHasChanged) {
				currentStepSelector = this.navSelector[newStep] + ' a';
				this.$('.navbar-nav li a').not(currentStepSelector).removeClass('active');
				this.$(currentStepSelector).addClass('active');
			}
			switch(newStep) {
				case Config.PROJ_LOC_STEP:
					var location = model.get('location');
					$chooseDataBtn = this.$(this.navSelector[Config.CHOOSE_DATA_STEP]);
					$processDataBtn = this.$(this.navSelector[Config.PROCESS_DATA_STEP]);

					if ((location) && _.has(location, 'latitude') && (location.latitude) &&
						_.has(location, 'longitude') && (location.longitude)) {
						$chooseDataBtn.removeClass('disabled');
					}
					else {
						$chooseDataBtn.addClass('disabled');
					}
					$processDataBtn.addClass('disabled');

					this.router.navigate('');
					break;

				case Config.CHOOSE_DATA_STEP:
					$processDataBtn = this.$(this.navSelector[Config.PROCESS_DATA_STEP]);
					//TODO: We will need to add code to remove the disabled class from the process Data button
					// when we know what will allow that step.
					$processDataBtn.addClass('disabled');
					if (model.has('location') &&
						_.has(model.attributes.location, 'latitude') && (model.attributes.location.latitude) &&
						_.has(model.attributes.location, 'longitude') && (model.attributes.location.longitude)) {
						this.router.navigate(this._getChooseDataUrl(model));
					}
					break;

				case Config.PROCESS_DATA_STEP:
					//TODO: probably will need to add things here as we figure out this step.
					break;
			}
		}

	});

	return view;
});


