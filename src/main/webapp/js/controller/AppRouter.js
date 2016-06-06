/*jslint browser: true */

define([
	'jquery',
	'backbone',
	'loglevel',
	'moment',
	'Config',
	'models/WorkflowStateModel',
	'views/DataDiscoveryView'
], function ($, Backbone, log, moment, Config, WorkflowStateModel, DataDiscoveryView) {
	"use strict";

	var DATE_FORMAT = 'DMMMYYYY';

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
			this.workflowState.set('step', Config.SPECIFY_AOI_STEP);
			this.createView(DataDiscoveryView, {
				model : this.workflowState
			}).render();
		},

		chooseDataState : function(lat, lng, radius, startDate, endDate, datasets) {
			this.workflowState.initializeDatasetCollections();
			this.workflowState.set({
				'location' : {latitude : lat, longitude : lng},
				'radius' : radius,
				'startDate' : (startDate) ? moment(startDate, DATE_FORMAT) : '',
				'endDate' : (endDate) ? moment(endDate, DATE_FORMAT) : ''
			});
			this.workflowState.set('step', Config.CHOOSE_DATA_FILTERS_STEP);
			this.createView(DataDiscoveryView, {
				model : this.workflowState
			}).render();
			this.workflowState.set('datasets', datasets ? datasets.split('/') : []);

		}
	});

	return appRouter;
});