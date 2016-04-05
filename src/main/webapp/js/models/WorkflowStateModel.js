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

			this.on('change:step', this.updateModelState);
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

				// Set up event listeners to update the dataset models
				this.on('change:location', this.updateDatasetCollections, this);
				this.on('change:radius', this.updateDatasetCollections, this);
			}
		},

		/*
		 * Returns the bounding box as an object with west, east, north, and south properties.
		 * Return undefined if the model's properties do not contain a valid bounding box
		 * @return {Object} - has west, east, north, south properties or undefined
		 */
		getBoundingBox : function() {
			var result = undefined;
			if ((this.attributes.radius) && (this.attributes.location) &&
				(this.attributes.location.latitude) && (this.attributes.location.longitude)) {
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

			var boundingBox = this.getBoundingBox();
			var chosenDatasets = this.has('datasets') ? this.get('datasets') : [];
			var datasetCollections = this.get('datasetCollections');
			var fetchDonePromises = [];
			var fetchErrors = [];

			var updateDataset = function(datasetCollection, datasetKind) {
				if (_.contains(chosenDatasets, datasetKind)) {
					var donePromise = $.Deferred();
					fetchDonePromises.push(donePromise);

					datasetCollection.fetch(boundingBox)
						.fail(function() {
							fetchErrors.push(datasetKind);
						})
						.always(function() {
							donePromise.resolve();
						});
				}
				else {
					datasetCollection.reset();
				}
			};

			if (boundingBox && (chosenDatasets.length > 0)) {
				this.trigger('dataset:updateStart');
				_.each(datasetCollections, updateDataset);
				$.when.apply(this, fetchDonePromises).done(function() {
					self.trigger('dataset:updateFinished', fetchErrors);
				});
			}
			else {
				// Clear the dataset collections if bounding box invalid or no chosen datasets
				_.each(datasetCollections, function(datasetCollection) {
					datasetCollection.reset();
				});
			}
		},

		updateModelState : function(model, newStep) {
			var previousStep = model.previous('step');

			switch(newStep) {
				case model.PROJ_LOC_STEP:
					if (model.has('datasetCollections')) {
						_.each(model.get('datasetCollections'), function(collection) {
							collection.reset();
						});
					};
					model.unset('location');
					model.unset('radius');
					model.unset('datasets');
					break;

				case model.CHOOSE_DATA_STEP:
					if (previousStep === model.PROJ_LOC_STEP) {
						model.set({
							radius : model.DEFAULT_CHOOSE_DATA_RADIUS,
							datasets : model.DEFAULT_CHOSEN_DATASETS
						});
					}
					model.initializeDatasetCollections();
					model.updateDatasetCollections(model, model.get('datasetCollections'));
					break;
			}
		}
	});

	return model;
});


