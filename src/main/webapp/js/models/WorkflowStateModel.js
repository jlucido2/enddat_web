/* jslint browser: true */

define([
	'underscore',
	'jquery',
	'backbone',
	'Config',
	'utils/geoSpatialUtils',
	'models/NWISCollection',
	'models/PrecipitationCollection'
], function(_, $, Backbone, Config, geoSpatialUtils, NWISCollection, PrecipitationCollection) {
	"use strict";

	var DEFAULT_CHOOSE_DATA_RADIUS = 2;
	var DEFAULT_CHOSEN_DATASETS = ['NWIS'];

	// Defaults for processing step
	var DEFAULT_TIME_INTERVAL = 6
	var DEFAULT_TIME_ZONE = '0_GMT'
	var DEFAULT_PROCESSING_TIME_RANGE_FROM_LATEST = 30; // Days after the latest selected variable's data.
	var DEFAULT_OUTPUT_DATA_FORMAT = 'Excel';
	var DEFAULT_OUTPUT_FORMAT = 'tab';

	var model = Backbone.Model.extend({


		defaults : function() {
			return {
				step : 'unknown',
				hasSelectedVariables : false
			};
		},

		initialize : function(attributes, options) {
			Backbone.Model.prototype.initialize.apply(this, arguments);

			this.on('change:step', this.updateModelState, this);
		},

		/*
		 * Instantiates the datasetModels and sets up the model event listeners which will fetch new
		 * dataset model information if the datasetCollections have not yet been instantiated. If they
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
					[Config.PRECIP_DATASET, new PrecipitationCollection()]
				]);
				this.set('datasetCollections', datasetCollections);
				this.on('change:radius', this.updateDatasetCollections, this);
				this.on('change:location', this.updateDatasetCollections, this);
				this.on('change:datasets', this.updateDatasetCollections, this);
			}
		},

		/*
		 * @returns {Boolean} - Returns true if the model contains a location property that contains
		 * an object with non empty latitude and longitude properties
		 */
		hasValidLocation : function() {
			return (this.has('location') &&
				((this.attributes.location.latitude) ? true : false) &&
				((this.attributes.location.longitude) ? true : false));

		},

		/*
		 * Returns the bounding box as an object with west, east, north, and south properties.
		 * Return undefined if the model's properties do not contain a valid bounding box
		 * @return {Object} - has west, east, north, south properties or undefined
		 */
		getBoundingBox : function() {
			var result = undefined;
			if ((this.attributes.radius) && this.hasValidLocation()) {
				result = geoSpatialUtils.getBoundingBox(
					this.attributes.location.latitude,
					this.attributes.location.longitude,
					this.attributes.radius
				);
			}
			return result;
		},

		getSelectedVariablesUrlParams : function() {
			var datasetCollections = this.get('datasetCollections');

			return _.chain(datasetCollections)
				.map(function(datasetCollection) {
					return datasetCollection.getSelectedVariablesUrlParams();
				})
				.flatten()
				.value();
		},


		/*
		 * Model event handlers
		 */

		 /*  If the radius or location has changed, all datasets are either fetched (if chosen) or cleared.
		  *  If the dataset has changed, then the previous datasets or compared to the current. Datasets added to the
		  *  current datasets are fetched and datasets removed from the current datasets are cleared.
		  */
		updateDatasetCollections : function() {
			var previousAttributes = this.previousAttributes();
			var boundingBox = this.getBoundingBox();
			var chosenDatasets = this.has('datasets') ? this.get('datasets') : [];
			var previousChosenDatasets = _.has(previousAttributes, 'datasets') ? previousAttributes.datasets : [];

			var datasetsToFetch = {};
			var datasetsToClear = {};

			if (this.hasChanged('radius') || this.hasChanged('location')) {
				//Need to fetch/clear all dataset collections
				if (boundingBox) {
					datasetsToFetch = chosenDatasets;
					datasetsToClear = _.difference(Config.ALL_DATASETS, chosenDatasets);
				}
				else {
					datasetsToClear = Config.ALL_DATASETS;
				}
			}
			else {
				//Update only datasets that have been added or removed from the chosen datasets
				datasetsToFetch = _.difference(chosenDatasets, previousChosenDatasets);
				datasetsToClear =  _.difference(previousChosenDatasets, chosenDatasets);
			}

			this.fetchDatasets(datasetsToFetch, boundingBox);
			this.clearDatasets(datasetsToClear);
		},

		/*
		 * Updates the state of the model based on the current step and the previous step.
		 */
		updateModelState : function() {
			var previousStep = this.previous('step');

			switch(this.get('step')) {
				case Config.PROJ_LOC_STEP:
					if (this.has('datasetCollections')) {
						_.each(this.get('datasetCollections'), function(collection) {
							collection.reset();
						});
					};
					this.unset('datasets');
					this.unset('location');
					this.unset('radius');
					this.unset('startDate');
					this.unset('endDate');
					break;

				case Config.CHOOSE_DATA_FILTERS_STEP:
					if (previousStep === Config.PROJ_LOC_STEP) {
						this.initializeDatasetCollections();
						this.set('datasets', DEFAULT_CHOSEN_DATASETS);
						this.set('radius', DEFAULT_CHOOSE_DATA_RADIUS);
					}
					break;

				case Config.PROCESS_DATA_STEP:
					this.set('processParams', {

					});
			}
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
		 * Event handler for dataset collection variables selected change handler.
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


