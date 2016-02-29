/*jslint browser: true */

define([
	'jquery',
	'backbone',
	'views/DataDiscoveryView'
], function ($, Backbone, DataDiscoveryView) {
	"use strict";

	var appRouter = Backbone.Router.extend({
		routes: {
			'': 'dataDiscoveryView'
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
			}, opts)).render();

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

		dataDiscoveryView: function () {
			this.createView(DataDiscoveryView,{});
		}
	});

	return appRouter;
});

