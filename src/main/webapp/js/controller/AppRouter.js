/*jslint browser: true */

define([
	'jquery',
	'backbone',
	'loglevel',
	'models/WorkflowStateModel',
	'views/DataDiscoveryView'
], function ($, Backbone, log, WorkflowStateModel, DataDiscoveryView) {
	"use strict";

	var appRouter = Backbone.Router.extend({
		routes: {
			'': 'specifyProjectLocationState',
			'lat/:lat/lng/:lng' : 'chooseDataState',
			'lat/:lat/lng/:lng(/radius/:radius)(/startdate/:startDate)(/enddate/:endDate)(/dataset/*datasets)' : 'chooseDataState',
		},

		initialize : function(options) {
			Backbone.Router.prototype.initialize.apply(this, arguments);
			this.workflowState = new WorkflowStateModel();
		},

		applicationContextDiv: '#main-content',

		/*
		 * Create a view a put in in the applicationContextDiv. This view becomes the router's currentView
		 * @param {Backbone.View} view - The view to create
		 * @param {Object} opts - options to use when creating the view
		 */
		createView: function (view, opts) {
			var newEl = $('<div />');

			this.removeCurrentView();
			$(this.applicationContextDiv).append(newEl);
			this.currentView = new view($.extend({
				el: newEl,
				router: this
			}, opts));

			return this.currentView;
		},

		/*
		 * Remove the currentView
		 */
		removeCurrentView: function () {
			if (this.currentView) {
				this.currentView.remove();
			}
		},

		specifyProjectLocationState: function () {
			this.workflowState.set('step', this.workflowState.PROJ_LOC_STEP);
			this.createView(DataDiscoveryView, {
				model : this.workflowState
			}).render();
		},

		chooseDataState : function(lat, lng, radius, startDate, endDate, datasets) {
			this.workflowState.set({
				'step' :this.workflowState.CHOOSE_DATA_STEP,
				'location' : {latitude : lat, longitude : lng},
				'radius' : radius,
				'startDate' : startDate,
				'endDate' : endDate,
				'datasets' : datasets ? datasets.split('/') : null
			});
			this.createView(DataDiscoveryView, {
				model : this.workflowState
			}).render();
		}
	});

	return appRouter;
});
