/* jslint browser: true */

define([
	'underscore',
	'jquery',
	'moment',
	'backbone',
	'Config',
	'utils/geoSpatialUtils',
	'models/NWISCollection',
	'models/PrecipitationCollection',
	'models/ACISCollection',
	'models/AOIModel'
], function(_, $, moment, Backbone, Config, geoSpatialUtils, NWISCollection, PrecipitationCollection, ACISCollection, AOIModel) {
	"use strict";

	var DEFAULT_CHOOSE_DATA_RADIUS = 2;
	var DEFAULT_CHOSEN_DATASETS = ['NWIS'];

	// Defaults for processing step
	var DEFAULT_TIME_ZONE = '0_GMT';
	var DEFAULT_OUTPUT_DATE_FORMAT = 'Excel';
	var DEFAULT_OUTPUT_FORMAT = 'tab';

	var model = Backbone.Model.extend({


		defaults : function() {
			return {
				step : 'unknown',
				hasSelectedVariables : false,
				aoi : new AOIModel
			};
		},

		initialize : function(attributes, options) {
			Backbone.Model.prototype.initialize.apply(this, arguments);

			this.on('change:step', this.updateModelState, this);
		},

		/*
		 * Instantiates the datasetModels and sets up the model event listeners which will fetch new
		 * dataset model information when needed. If they
		 * have already been created, empty the contents of the collections
		 */
		initializeDatasetCollections : function() {
			var datasetCollections;
			if (this.has('datasetCollections')) {
				_.each(this.get('datasetCollections'), function(collection) {
					collection.reset();
				});
			}
			else {
				datasetCollections = _.object([
					[Config.NWIS_DATASET, new NWISCollection()],
					[Config.PRECIP_DATASET, new PrecipitationCollection()],
					[Config.ACIS_DATASET, new ACISCollection()]
				]);
				this.set('datasetCollections', datasetCollections);

				this.get('aoi').on('change', this.changeAOI, this);
				this.on('change:datasets', this.updateDatasetCollections, this);
			}
		},

		/*
		 * @returns {Array of Backbone.models representing the selected variables}
		 */
		getSelectedVariables : function() {
			var datasetCollections = this.get('datasetCollections');
			return _.chain(datasetCollections)
				.map(function(datasetCollection) {
					return datasetCollection.getSelectedVariables();
				})
				.flatten()
				.value();
		},

		/*
		 * Model event handlers
		 */

		 /*
		  *  The previous datasets are compared to the current. Datasets added to the
		  *  current datasets are fetched and datasets removed from the current datasets are cleared.
		  */
		updateDatasetCollections : function() {
			var previousAttributes = this.previousAttributes();
			var boundingBox = this.get('aoi').getBoundingBox();
			var chosenDatasets = this.has('datasets') ? this.get('datasets') : [];
			var previousChosenDatasets = _.has(previousAttributes, 'datasets') ? previousAttributes.datasets : [];

			//Update only datasets that have been added or removed from the chosen datasets
			var datasetsToFetch = _.difference(chosenDatasets, previousChosenDatasets);
			var datasetsToClear =  _.difference(previousChosenDatasets, chosenDatasets);

			this.fetchDatasets(datasetsToFetch, boundingBox);
			this.clearDatasets(datasetsToClear);
		},

		/*
		 * If the aoi property contains a model with a defined bounding box, then
		 * fetch all chosen datasets. Otherwise clear all datasets.
		 */
		changeAOI : function() {
			var boundingBox = this.get('aoi').getBoundingBox();
			var chosenDatasets = this.has('datasets') ? this.get('datasets') : [];
			if (boundingBox) {
				this.fetchDatasets(chosenDatasets, boundingBox);
			}
			else {
				this.clearDatasets(Config.ALL_DATASETS);
			}
		},

		/*
		 * Updates the state of the model based on the current step and the previous step.
		 */
		updateModelState : function() {
			var previousStep = this.previous('step');
			var outputDateRange = undefined;

			switch(this.get('step')) {
				case Config.SPECIFY_AOI_STEP:
					if (this.has('datasetCollections')) {
						_.each(this.get('datasetCollections'), function(collection) {
							collection.reset();
						});
					};
					this.unset('datasets');
					//TODO add code to allow switching between project location and aoi box.
					this.get('aoi').set({
						'latitude' : '',
						'longitude' : '',
						'radius' : DEFAULT_CHOOSE_DATA_RADIUS
					});
					break;

				case Config.CHOOSE_DATA_FILTERS_STEP:
					if (previousStep === Config.SPECIFY_AOI_STEP) {
						this.initializeDatasetCollections();
						this.set('datasets', DEFAULT_CHOSEN_DATASETS);
					}
					break;

				case Config.PROCESS_DATA_STEP:
					var outputDateRange;
					var startDate = this.get('startDate');
					var endDate = this.get('endDate');
					var selectedVarsDateRange = this.getSelectedVarsDateRange();
					var selectedVars = this.getSelectedVariables();

					if ((startDate) && (endDate)) {
						outputDateRange = {
							start : startDate,
							end : endDate
						};
					}
					else {
						outputDateRange = {
							start : moment(selectedVarsDateRange.end).subtract(1, 'month'),
							end : selectedVarsDateRange.end
						};
					}

					//Initialize time series options for each selected variable to return raw
					_.each(selectedVars, function(variableModel) {
						variableModel.set('timeSeriesOptions', [{statistic : 'raw'}]);
					});

					this.set({
						outputFileFormat : DEFAULT_OUTPUT_FORMAT,
						outputTimeZone : DEFAULT_TIME_ZONE,
						outputDateFormat : DEFAULT_OUTPUT_DATE_FORMAT,
						outputDateRange : outputDateRange
					});
			}
		},

		/*
		 * Returns the union of the selected data variables date range
		 * @returns {Object with start and end properties}. Returns undefined if there are no selected variables
		 */
		getSelectedVarsDateRange : function() {
			var result = undefined;
			var dateRanges;
			var datasetCollections = (this.has('datasetCollections')) ? this.get('datasetCollections') : {};
			if (!_.isEmpty(datasetCollections)) {
				dateRanges = _.chain(datasetCollections)
					.map(function(datasetCollection) {
						return datasetCollection.getSelectedDateRange();
					})
					.filter(function(dateRange) {
						return (dateRange);
					})
					.value();
				if (dateRanges.length > 0) {
					result = {
						start : moment.min(_.pluck(dateRanges, 'start')),
						end : moment.max(_.pluck(dateRanges, 'end'))
					};
				}
			}
			return result;
		},

		/*
		 * Internal function which retrieves the datasets in datasetKinds.
		 * @param {Array of String} datasetKinds
		 * @param {Object with north, south, east, west properties} boundingBox
		 */
		fetchDatasets : function(datasetKinds, boundingBox) {
			var self = this;
			var datasetsToFetch = _.pick(this.get('datasetCollections'), datasetKinds);
			var fetchDonePromises = [];

			var fetchDataset = function(datasetCollection, datasetKind) {
				var donePromise = $.Deferred();
				datasetCollection.fetch(boundingBox)
					.done(function() {
						/* set up event handlers to update hasSelectedVariables */
						datasetCollection.each(function(siteModel) {
							siteModel.get('variables').each(function(variableModel) {
								variableModel.on('change:selected', self.updateHasSelectedVariables, self);
							});
						});
						donePromise.resolve();
					})
					.fail(function() {
						donePromise.resolve(datasetKind);
					});
				return donePromise;
			};

			this.trigger('dataset:updateStart');
			if (!_.isEmpty(datasetsToFetch) && (boundingBox)) {
				fetchDonePromises = _.map(datasetsToFetch, fetchDataset);
				$.when.apply(this, fetchDonePromises).done(function() {
					var datasetKindErrors = _.filter(arguments, function(arg) {
						return (arg) ? true : false;
					});
					self.trigger('dataset:updateFinished', datasetKindErrors);
				});
			}
			else {
				this.trigger('dataset:updateFinished', []);
			}
		},

		/*
		 * Internal function which clears the datasets in datasetKinds
		 * @param {Array of String} datasetKinds
		 */
		clearDatasets : function(datasetKinds) {
			var datasetsToClear = _.pick(this.get('datasetCollections'), datasetKinds);
			_.each(datasetsToClear, function(datasetCollection) {
				datasetCollection.reset();
			});
		},

		/*
		 * Model event handler for dataset collection variables selected change handler.
		 */
		updateHasSelectedVariables : function() {
			var hasSelectedVariables = _.some(this.get('datasetCollections'), function(datasetCollection) {
				return datasetCollection.hasSelectedVariables();
			});
			this.set('hasSelectedVariables', hasSelectedVariables);
		}
	});

	return model;
});


