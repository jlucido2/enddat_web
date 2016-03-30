/* jslint browser: true */

define([
	'underscore',
	'jquery',
	'backbone',
	'utils/geoSpatialUtils',
	'models/SiteModel',
	'models/PrecipitationCollection'
], function(_, $, Backbone, geoSpatialUtils, SiteModel, PrecipitationCollection) {
	"use strict";

	var model = Backbone.Model.extend({
		NWIS_DATASET : 'NWIS',
		PRECIP_DATASET : 'PRECIP',

		PROJ_LOC_STEP : 'specifyProjectLocation',
		CHOOSE_DATA_STEP : 'chooseData',
		PROCESS_DATA_STEP :'processData',

		defaults : function() {
			return {
				step : 'unknown',
				datasetModels : _.object([
					[this.NWIS_DATASET, this.PRECIP_DATASET],
					[undefined, undefined]
				])
			};
		},

		/*
		 * Instantiates the datasetModels and sets up the model event listeners which will fetch new
		 * dataset model information.
		 */
		initializeDatasetModels : function() {
			var datasetModels = _.object([
				[this.NWIS_DATASET, new SiteModel()],
				[this.PRECIP_DATASET, new PrecipitationCollection()]
			]);
			this.set('datasetModels', datasetModels);

			// Set up event listeners to update the dataset models
			this.on('change:location', this.updateDatasetModels, this);
			this.on('change:radius', this.updateDatasetModels, this);
		},

		/*
		 * Model event handlers
		 */

		 /*
		  *  Fetches the chosen datasets if the bounding box is valid. Otherwise it clears the datasets
		  */
		updateDatasetModels : function() {
			var self = this;

			var boundingBox = this.getBoundingBox();
			var chosenDatasets = this.has('datasets') ? this.get('datasets') : [];
			var datasetModels = this.get('datasetModels');
			var fetchDonePromises = [];
			var fetchErrors = [];

			var updateDataset = function(datasetModel, datasetKind) {
				if (_.contains(chosenDatasets, datasetKind)) {
					var donePromise = $.Deferred();
					fetchDonePromises.push(donePromise);

					datasetModel.fetch(boundingBox)
						.fail(function() {
							fetchErrors.push(datasetKind);
						})
						.always(function() {
							donePromise.resolve();
						});
				}
				else {
					if (datasetModel.models) {
					// Then must be a collection so reset
						datasetModel.reset();
					}
					else {
						datasetModel.clear();
					}
				}
			};
			if (boundingBox && (chosenDatasets.length > 0)) {
				this.trigger('dataset:updateStart');
				_.each(datasetModels, updateDataset);
				$.when.apply(this, fetchDonePromises).done(function() {
					self.trigger('dataset:updateFinished', fetchErrors);
				});
			}
			else {
				// Clear the dataset models if bounding box invalid or no chosen datasets
				_.each(datasetModels, function(datasetModel) {
					if (datasetModel.models) {
						// Then must be a collection so reset
						datasetModel.reset();
					}
					else {
						datasetModel.clear();
					}
				});
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
		}
	});

	return model;
});


