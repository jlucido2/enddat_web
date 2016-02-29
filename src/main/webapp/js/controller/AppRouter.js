/*jslint browser: true */

define([
	'jquery',
	'backbone',
	'models/WorkflowStateModel',
	'views/DataDiscoveryView'
], function ($, Backbone, WorkflowStateModel, DataDiscoveryView) {
	"use strict";

	var appRouter = Backbone.Router.extend({
		routes: {
			'': 'specifyProjectLocationState'
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
			if (!this.workflowState.isSpecifyProjectLocationStep()) {
				this.workflowState.clear();
				this.workflowState.setSpecifyProjectLocationStep();
			}
			if (!this.dataDiscoveryView) {
				this.dataDiscoveryView = this.createView(DataDiscoveryView, {
					model : this.workflowState
				}).render();
			}
		}
	});

	return appRouter;
});

