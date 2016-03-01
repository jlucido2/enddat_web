/* jslint browser : true */

define([
	'bootstrap', // Needed by the bootstrap navbar
	'loglevel',
	'views/BaseView',
	'hbs!hb_templates/workflowNav'
], function(bootstrap, log, BaseView, hb_template) {
	"use strict";

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
			this.updateNavigation();
			return this;
		},

		goToProjectLocationStep : function(ev) {
			ev.preventDefault();
			this.model.clear({silent : true});
			this.model.set({
				step : this.model.PROJ_LOC_STEP,
				location : {}
			});
			this.$('#workflow-nav-collapse').focus();
		},
		goToChooseDataStep : function(ev) {
			ev.preventDefault();
			this.model.set({step : this.model.CHOOSE_DATA_STEP});
			this.$('nav').focus();
		},
		goToProcessDataStep : function(ev) {
			ev.preventDefault();
			this.model.set({step : this.model.PROCESS_DATA_STEP});
			this.$('#workflow-nav-collapse').focus();
		},

		updateNavigation : function(model) {
			var newStep = this.model.get('step');

			var $chooseDataBtn, $processDataBtn, currentStepSelector;

			if (this.model.hasChanged('step')) {
				currentStepSelector = this.navSelector[newStep] + ' a';
				this.$('.navbar-nav li a').not(currentStepSelector).removeClass('active');
				this.$(currentStepSelector).addClass('active');
			}
			switch(newStep) {
				case this.model.PROJ_LOC_STEP:
					$chooseDataBtn = this.$(this.navSelector[this.model.CHOOSE_DATA_STEP]);
					$processDataBtn = this.$(this.navSelector[this.model.PROCESS_DATA_STEP]);
					if (this.model.has('location')) {
						$chooseDataBtn.removeClass('disabled');
					}
					else {
						$chooseDataBtn.addClass('disabled');
					}
					$processDataBtn.addClass('disabled');
					break;

				case this.model.CHOOSE_DATA_STEP:
					$processDataBtn = this.$(this.navSelector[this.model.PROCESS_DATA_STEP]);
					//TODO: We will need to add code to remove the disabled class from the process Data button
					// when we know what will allow that step.
					$processDataBtn.addClass('disabled');
					break;

				case this.model.PROCESS_DATA_STEP:
					//TODO: probably will need to add things here as we figure out this step.
					break;

				default:
					log.error('Unknown workflow step');
			}
		}

	});

	return view;
});


