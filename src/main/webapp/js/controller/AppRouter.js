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

	var appRouter = Backbone.Router.extend({
		routes: {
			'': 'specifyProjectLocationState',
			'lat/:lat/lng/:lng/radius/:radius(/startdate/:startDate)(/enddate/:endDate)(/dataset/*datasets)' : 'chooseDataStateProjLoc',
			'aoiBbox/:bbox(/startdate/:startDate)(/enddate/:endDate)(/dataset/*datasets)' : 'chooseDataStateAOIBox'
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

		chooseDataState : function(aoi, startDate, endDate, datasets) {
			this.workflowState.initializeDatasetCollections();
			this.workflowState.get('aoi').set(aoi);
			this.workflowState.set({
				'startDate' : (startDate) ? moment(startDate, Config.DATE_FORMAT_URL) : '',
				'endDate' : (endDate) ? moment(endDate, Config.DATE_FORMAT_URL) : ''
			});
			this.workflowState.set('step', Config.CHOOSE_DATA_FILTERS_STEP);
			this.createView(DataDiscoveryView, {
				model : this.workflowState
			}).render();
			this.workflowState.set('datasets', datasets ? datasets.split('/') : []);
		},

		chooseDataStateProjLoc : function(lat, lng, radius, startDate, endDate, datasets) {
			var aoi = {
				latitude : lat,
				longitude : lng,
				radius : radius
			};
			this.chooseDataState(aoi, startDate, endDate, datasets);
		},

		chooseDataStateAOIBox : function(bboxStr, startDate, endDate, datasets) {
			var bboxArr = bboxStr.split(',');
			var aoi = {
				aoiBox : {
					south : parseFloat(bboxArr[0]),
					west : parseFloat(bboxArr[1]),
					north : parseFloat(bboxArr[2]),
					east : parseFloat(bboxArr[3])
				}
			};
			this.chooseDataState(aoi, startDate, endDate, datasets);
		}
	});

	return appRouter;
});