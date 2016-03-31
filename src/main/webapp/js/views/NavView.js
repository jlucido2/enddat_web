/* jslint browser : true */

define([
	'underscore',
	'bootstrap', // Needed by the bootstrap navbar
	'loglevel',
	'views/BaseView',
	'hbs!hb_templates/workflowNav'
], function(_, bootstrap, log, BaseView, hb_template) {
	"use strict";

	var DEFAULT_RADIUS = 2;
	var DEFAULT_DATASETS = ['NWIS'];

	var view = BaseView.extend({
		template : hb_template,

		events : {
			'click .nav-project-loc a' : 'goToProjectLocationStep',
			'click .nav-choose-data a' : 'goToChooseDataStep',
			'click .nav-process-data a' : 'goToProcessDataStep'
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
			this.navSelector[this.model.PROJ_LOC_STEP] = '.nav-project-loc';
			this.navSelector[this.model.CHOOSE_DATA_STEP] = '.nav-choose-data';
			this.navSelector[this.model.PROCESS_DATA_STEP] = '.nav-process-data';

			this.listenTo(this.model, 'change', this.updateNavigation);
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this.updateNavigation(this.model, true);
			return this;
		},

		/*
		 * DOM Event handlers
		 */
		goToProjectLocationStep : function(ev) {
			ev.preventDefault();
			if (this.model.get('step') !== this.model.PROJ_LOC_STEP) {
				this.model.set('step', this.model.PROJ_LOC_STEP);
			}
		},
		goToChooseDataStep : function(ev) {
			ev.preventDefault();
			if (this.model.get('step') !== this.model.CHOOSE_DATA_STEP) {
				this.model.set('step', this.model.CHOOSE_DATA_STEP);
			}
		},
		goToProcessDataStep : function(ev) {
			ev.preventDefault();
			if (this.model.get('step') !== this.model.PROCESS_DATA_STEP) {
				this.model.set({step : this.model.PROCESS_DATA_STEP});
			}
		},

		_getChooseDataUrl : function(model) {
			var state = model.attributes;
			var location = 'lat/' + state.location.latitude + '/lng/' + state.location.longitude;
			var radius = (model.has('radius')) ? '/radius/' + state.radius : '';
			var startDate = (model.has('startDate')) ? '/startdate/' + state.startDate : '';
			var endDate = (model.has('endDate')) ? '/enddate/' + state.endDate : '';
			var datasets = (model.has('datasets')) ? '/dataset/' + state.datasets.join('/') : '';
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
				case model.PROJ_LOC_STEP:
					var location = model.get('location');
					$chooseDataBtn = this.$(this.navSelector[model.CHOOSE_DATA_STEP]);
					$processDataBtn = this.$(this.navSelector[model.PROCESS_DATA_STEP]);

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

				case model.CHOOSE_DATA_STEP:
					$processDataBtn = this.$(this.navSelector[model.PROCESS_DATA_STEP]);
					//TODO: We will need to add code to remove the disabled class from the process Data button
					// when we know what will allow that step.
					$processDataBtn.addClass('disabled');
					this.router.navigate(this._getChooseDataUrl(model));

					break;

				case model.PROCESS_DATA_STEP:
					//TODO: probably will need to add things here as we figure out this step.
					break;
			}
		}

	});

	return view;
});


