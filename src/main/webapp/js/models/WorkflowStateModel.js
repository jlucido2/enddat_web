/* jslint browser: true */

define([
	'underscore',
	'jquery',
	'backbone',
	'utils/geoSpatialUtils',
	'models/SiteCollection',
	'models/PrecipitationCollection'
], function(_, $, Backbone, geoSpatialUtils, SiteCollection, PrecipitationCollection) {
	"use strict";

	var model = Backbone.Model.extend({
		NWIS_DATASET : 'NWIS',
		PRECIP_DATASET : 'PRECIP',
		ALL_DATASETS : ['NWIS', 'PRECIP'],

		PROJ_LOC_STEP : 'specifyProjectLocation',
		CHOOSE_DATA_STEP : 'chooseData',
		PROCESS_DATA_STEP :'processData',

		DEFAULT_CHOOSE_DATA_RADIUS : 2,
		DEFAULT_CHOSEN_DATASETS : ['NWIS'],

		defaults : function() {
			return {
				step : 'unknown'
			};
		},

		initialize : function(attributes, options) {
			Backbone.Model.prototype.initialize.apply(this, arguments);

			this.on('change:step', this.updateModelState, this);
		},

		/*
		 * Instantiates the datasetModels and sets up the model event listeners which will fetch new
		 * dataset model information if the datasetCollections have not yet been instantiated. If they
		 * have already been created, reset the contents of the collections
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
					[this.NWIS_DATASET, new SiteCollection()],
					[this.PRECIP_DATASET, new PrecipitationCollection()]
				]);
				this.set('datasetCollections', datasetCollections);
				this.on('change:radius', this.updateDatasetCollections, this);
				this.on('change:location', this.updateDatasetCollections, this);
				this.on('change:datasets', this.updateDatasetCollections, this);
			}
		},

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

		/*
		 * Model event handlers
		 */

		 /*
		  *  Fetches the chosen datasets if the bounding box is valid. Otherwise it clears the datasets
		  */
		updateDatasetCollections : function() {
			var self = this;
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
					datasetsToClear = _.difference(this.ALL_DATASETS, chosenDatasets);
				}
				else {
					datasetsToClear = this.ALL_DATASETS;
				}
			}
			else {
				//Update only datasets that have been added or removed from the chosen datasets
				datasetsToFetch = _.difference(chosenDatasets, previousChosenDatasets);
				datasetsToClear =  _.difference(previousChosenDatasets, chosenDatasets);
			}

			this.fetchDatasets(datasetsToFetch);
			this.clearDatasets(datasetsToClear);
		},

		updateModelState : function() {
			var previousStep = this.previous('step');

			switch(this.get('step')) {
				case this.PROJ_LOC_STEP:
					if (this.has('datasetCollections')) {
						_.each(this.get('datasetCollections'), function(collection) {
							collection.reset();
						});
					};
					this.unset('location', {silent : true});
					this.unset('radius', {silent : true});
					this.unset('datasets', {silent : true});
					break;

				case this.CHOOSE_DATA_STEP:
					if (previousStep === this.PROJ_LOC_STEP) {
						this.initializeDatasetCollections();
						this.set('datasets', this.DEFAULT_CHOSEN_DATASETS, {silent: true});
						this.set('radius', this.DEFAULT_CHOOSE_DATA_RADIUS);
					}
					break;
			}
		},

		fetchDatasets : function(datasetKinds) {
			var self = this;
			var datasetsToFetch = _.pick(this.get('datasetCollections'), datasetKinds);
			var boundingBox = this.getBoundingBox();
			var fetchDonePromises = [];

			var fetchDataset = function(datasetCollection, datasetKind) {
				var donePromise = $.Deferred();
				datasetCollection.fetch(boundingBox)
					.done(function() {
						donePromise.resolve();
					})
					.fail(function() {
						donePromise.resolve(datasetKind);
					});
				return donePromise;
			};

			if (!_.isEmpty(datasetsToFetch) && (boundingBox)) {
				this.trigger('dataset:updateStart');
				fetchDonePromises = _.map(datasetsToFetch, fetchDataset);
				$.when.apply(this, fetchDonePromises).done(function() {
					var datasetKindErrors = _.filter(arguments, function(arg) {
						return (arg) ? true : false;
					});
					self.trigger('dataset:updateFinished', datasetKindErrors);
				});
			}
		},

		clearDatasets : function(datasetKinds) {
			var datasetsToClear = _.pick(this.get('datasetCollections'), datasetKinds);
			_.each(datasetsToClear, function(datasetCollection) {
				datasetCollection.reset();
			});
		}
	});

	return model;
});


