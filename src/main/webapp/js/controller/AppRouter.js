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

	var getAOIBox = function(bboxStr) {
		var bboxArr = bboxStr.split(',');
		return {
			south : parseFloat(bboxArr[0]),
			west : parseFloat(bboxArr[1]),
			north : parseFloat(bboxArr[2]),
			east : parseFloat(bboxArr[3])
		};
	};

	var appRouter = Backbone.Router.extend({
		routes: {
			'': 'specifyProjectLocationState',
			'lat/:lat/lng/:lng/radius/:radius(/startdate/:startDate)(/enddate/:endDate)/dataset/*datasets' : 'chooseDataStateProjLoc',
			'aoiBbox/:bbox(/startdate/:startDate)(/enddate/:endDate)/dataset/*datasets' : 'chooseDataStateAOIBox',
			'lat/:lat/lng/:lng/radius/:radius(/startdate/:startDate)(/enddate/:endDate)/variable/*variables' : 'chooseByVariableStateProjLoc',
			'aoiBbox/:bbox(/startdate/:startDate)(/enddate/:endDate)/variable/*variables' : 'chooseByVariableStateAOIBox'
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

		chooseDataState : function(workflowStep, state) {
			this.workflowState.initializeDatasetCollections();
			this.workflowState.get('aoi').set(state.aoi);
			this.workflowState.set({
				'startDate' : (state.startDate) ? moment(state.startDate, Config.DATE_FORMAT_URL) : '',
				'endDate' : (state.endDate) ? moment(state.endDate, Config.DATE_FORMAT_URL) : ''
			});
			this.workflowState.set('step', workflowStep);
			this.createView(DataDiscoveryView, {
				model : this.workflowState
			}).render();
			this.workflowState.set('datasets', state.datasets ? state.datasets.split('/') : []);
			this.workflowState.set('variableKinds', state.variables ? state.variables.split('/') : []);
		},

		chooseDataStateProjLoc : function(lat, lng, radius, startDate, endDate, datasets) {
			var state = {
				aoi : {
					latitude : lat,
					longitude : lng,
					radius : radius
				},
				startDate : startDate,
				endDate : endDate,
				datasets : datasets,
				variables : undefined
			};

			this.chooseDataState(Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP, state);
		},

		chooseDataStateAOIBox : function(bboxStr, startDate, endDate, datasets) {
			var state = {
				aoi : {
					aoiBox : getAOIBox(bboxStr)
				},
				startDate : startDate,
				endDate : endDate,
				datasets : datasets,
				variables : undefined
			};
			this.chooseDataState(Config.CHOOSE_DATA_BY_SITE_FILTERS_STEP, state);
		},

		chooseByVariableStateProjLoc : function(lat, lng, radius, startDate, endDate, variables) {
			var state = {
				aoi : {
					latitude : lat,
					longitude : lng,
					radius : radius
				},
				startDate : startDate,
				endDate : endDate,
				datasets : undefined,
				variables : variables
			};

			this.chooseDataState(Config.CHOOSE_DATA_BY_VARIABLES_STEP, state);
		},

		chooseByVariableStateAOIBox : function(bboxStr, startDate, endDate, variables) {
			var state = {
				aoi : {
					aoiBox : getAOIBox(bboxStr)
				},
				startDate : startDate,
				endDate : endDate,
				datasets : undefined,
				variables : variables
			};
			this.chooseDataState(Config.CHOOSE_DATA_BY_VARIABLES_STEP, state);
		}
	});

	return appRouter;
});