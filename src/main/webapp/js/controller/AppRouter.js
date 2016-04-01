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
			'lat/:lat/lng/:lng(/radius/:radius)(/startdate/:startDate)(/enddate/:endDate)(/dataset/*datasets)' : 'chooseDataState'
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
			this.createView(DataDiscoveryView, {
				model : this.workflowState
			}).render();
			this.workflowState.set('step', this.workflowState.PROJ_LOC_STEP);
		},

		chooseDataState : function(lat, lng, radius, startDate, endDate, datasets) {
			this.createView(DataDiscoveryView, {
				model : this.workflowState
			}).render();
			this.workflowState.set({
				'location' : {latitude : lat, longitude : lng},
				'radius' : radius,
				'startDate' : startDate,
				'endDate' : endDate,
				'datasets' : datasets ? datasets.split('/') : []
			});
			this.workflowState.set('step', this.workflowState.CHOOSE_DATA_STEP);
		}
	});

	return appRouter;
});