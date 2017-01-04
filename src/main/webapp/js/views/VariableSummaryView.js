/* jslint browser: true */
/* global parseFloat */

define([
	'underscore',
	'Config',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/variableSummary'
], function(_, Config, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Jquery string selector or element} $el
	 *		@prop {WorkflowStateModel} model
	 */
	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Selected Variables',
		panelBodyId : 'variable-summary-panel-body',

		additionalEvents : {
			'click tbody button' : 'removeVariable'
		},

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.selectedDatasets = _.object([
  				[Config.GLCFS_DATASET, []],
				[Config.PRECIP_DATASET, []],
				[Config.NWIS_DATASET, []],
				[Config.ACIS_DATASET, []],
				[Config.EC_DATASET, []]
			]);
			this.hasBeenRendered = false;

			//Set up model event listeners
			if (this.model.has('datasetCollections')) {
					this.setupDatasetCollectionsListeners(this.model, this.model.get('datasetCollections'));
				}
			else {
				this.listenTo(this.model, 'change:datasetCollections', this.setupDatasetCollectionsListeners);
			}
		},

		render : function() {
			this.context.selectedDatasets = _.map(this.selectedDatasets, function(values, datasetKind) {
				return {
					datasetName : datasetKind,
					variables : values
				};
			});
			this.context.hasSelectedVariables = this.model.has('datasetCollections') && _.some(this.model.get('datasetCollections'), function(collection) {
				return collection.hasSelectedVariables();
			});

			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.hasBeenRendered = true;
			return this;
		},

		/*
		 * Helper function for a dataset collection, that sets up the model event listeners for the variables for the selected property,
		 * using changeSelectedHandlerFnc for the event handler.
		 * Once these are setup, call changeSelectedHandlerFnc to update the display
		 * @param {BaseDatasetCollection} collection
		 * @param {Function} changeSelectedHandlerFnc
		 */
		_setupDatasetVariableListeners : function(collection, changeSelectedHandlerFnc) {
			var self = this;

			collection.each(function(siteModel) {
				var variableCollection = siteModel.get('variables');
				variableCollection.each(function(variableModel) {
					self.listenTo(variableModel, 'change:selected', changeSelectedHandlerFnc);
				});
			});
			_.bind(changeSelectedHandlerFnc, this)();
		},

		/*
		 * Helper function to get the list of selected variables for a collection and update the
		 * selectedDatasets by apply getContextVariable to each selected variable
		 * @param {BaseDatasetCollection} collection
		 * @param {String} datasetKind
		 * @param {Function} getContextVariable - should take a variableModel and siteModel parameters
		 * @returns {undefined}
		 */
		_updateSelectedVariableContext : function(collection, datasetKind, getContextVariable) {
			var contextVars = [];
			collection.each(function(siteModel) {
				var selectedVariables = siteModel.get('variables').getSelectedVariables();
				_.each(selectedVariables, function(variableModel) {
					contextVars.push(getContextVariable(variableModel, siteModel));
				});
			});
			this.selectedDatasets[datasetKind] = contextVars;

			if (this.hasBeenRendered) {
				this.render();
			}
		},

		/*
		 *  Model event listeners and helper functions
		 */

		/*
		 *
		 * @param {WorkflowStateModel} model
		 * @param {Object, each property represents a dataset} datasetCollections
		 * @returns {undefined}
		 */
		setupDatasetCollectionsListeners : function(model, datasetCollections) {
			var glcfsCollection = datasetCollections[Config.GLCFS_DATASET];
			var precipCollection = datasetCollections[Config.PRECIP_DATASET];
			var nwisCollection = datasetCollections[Config.NWIS_DATASET];
			var acisCollection = datasetCollections[Config.ACIS_DATASET];
			var ecCollection = datasetCollections[Config.EC_DATASET];

			this.listenTo(glcfsCollection, 'reset', this.setupGLCFSModelListeners);
			this.listenTo(precipCollection, 'reset', this.setupPrecipModelListeners);
			this.listenTo(nwisCollection, 'reset', this.setupNWISModelListeners);
			this.listenTo(acisCollection, 'reset', this.setupACISModelListeners);
			this.listenTo(ecCollection, 'reset', this.setupECModelListeners);

			this.setupGLCFSModelListeners(glcfsCollection);
			this.setupPrecipModelListeners(precipCollection);
			this.setupNWISModelListeners(nwisCollection);
			this.setupACISModelListeners(acisCollection);
			this.setupECModelListeners(ecCollection);
		},

		/*
		 * Sets up the event listeners for changes in the selected property for each site's variable for the GLCFS dataset
		 * @param {BaseDatasetCollection} collection
		 */
		setupGLCFSModelListeners : function(collection) {
			this._setupDatasetVariableListeners(collection, this.updateSelectedGLCFSPoints);
		},

		/*
		 * Updates the selectedDatasets for GLCFS points
		 */
		updateSelectedGLCFSPoints : function() {
			var getContextVariable = function(variableModel, glcfsModel) {
				return {
					modelId : glcfsModel.cid,
					variableId : variableModel.cid,
					siteId : (parseFloat(glcfsModel.attributes.lat)).toFixed(3) + ', ' + (parseFloat(glcfsModel.attributes.lon)).toFixed(3),
					startDate : variableModel.attributes.startDate.format(Config.DATE_FORMAT),
					endDate : variableModel.attributes.endDate.format(Config.DATE_FORMAT),
					property : variableModel.attributes.description
				};
			};
			var datasetCollection = this.model.get('datasetCollections')[Config.GLCFS_DATASET];
			this._updateSelectedVariableContext(datasetCollection, Config.GLCFS_DATASET, getContextVariable);
		},

		/*
		 * Updates the selectedDatasets for precipitation points
		 */
		updateSelectedPrecipPoints : function() {
			var getContextVariable = function(variableModel, precipModel) {
				return {
					modelId : precipModel.cid,
					variableId : variableModel.cid,
					siteId : (parseFloat(precipModel.attributes.lat)).toFixed(3) + ', ' + (parseFloat(precipModel.attributes.lon)).toFixed(3),
					startDate : variableModel.attributes.startDate.format(Config.DATE_FORMAT),
					endDate : variableModel.attributes.endDate.format(Config.DATE_FORMAT),
					property : variableModel.attributes.y + ':' + variableModel.attributes.x
				};
			};
			var datasetCollection = this.model.get('datasetCollections')[Config.PRECIP_DATASET];
			this._updateSelectedVariableContext(datasetCollection, Config.PRECIP_DATASET, getContextVariable);
		},

		/*
		 * Sets up the event listeners for changes in the selected property for each site's variable for the precipitation dataset
		 * @param {BaseDatasetCollection} collection
		 */
		setupPrecipModelListeners : function(collection) {
			this._setupDatasetVariableListeners(collection, this.updateSelectedPrecipPoints);
		},

		/*
		 * Updates the selectedDatasets for NWIS sites
		 */
		updateSelectedNWISVariables : function() {
			var getContextVariable = function(variableModel, nwisModel) {
				return {
					modelId : nwisModel.cid,
					variableId : variableModel.cid,
					siteId : nwisModel.attributes.siteNo,
					startDate : variableModel.attributes.startDate.format(Config.DATE_FORMAT),
					endDate : variableModel.attributes.endDate.format(Config.DATE_FORMAT),
					property : variableModel.attributes.name
				};
			};
			var datasetCollection = this.model.get('datasetCollections')[Config.NWIS_DATASET];
			this._updateSelectedVariableContext(datasetCollection, Config.NWIS_DATASET, getContextVariable);
		},

		/*
		 * Sets up the event listeners for changes in the selected property for each site's variable for the NWIS dataset
		 * @param {BaseDatasetCollection} collection
		 */
		setupNWISModelListeners : function(collection) {
			this._setupDatasetVariableListeners(collection, this.updateSelectedNWISVariables);
		},

		/*
		 * Updates the selectedDatasets for ACIS sites
		 */
		updateSelectedACISVariables : function() {
			var getContextVariable = function(variableModel, acisModel) {
				return {
					modelId : acisModel.cid,
					variableId : variableModel.cid,
					siteId : acisModel.attributes.sid,
					startDate : variableModel.attributes.startDate.format(Config.DATE_FORMAT),
					endDate : variableModel.attributes.endDate.format(Config.DATE_FORMAT),
					property : variableModel.attributes.description
				};
			};
			var datasetCollection = this.model.get('datasetCollections')[Config.ACIS_DATASET];
			this._updateSelectedVariableContext(datasetCollection, Config.ACIS_DATASET, getContextVariable);
		},

		/*
		 * Sets up the event listeners for changes in the selected property for each site's variable for the ACIS dataset
		 * @param {BaseDatasetCollection} collection
		 */
		setupACISModelListeners : function(collection) {
			this._setupDatasetVariableListeners(collection, this.updateSelectedACISVariables);
		},

		/*
		 * Updates the selectedDatasets for ACIS sites
		 */
		updateSelectedECVariables : function() {
			var getContextVariable = function(variableModel, ecModel) {
				return {
					modelId : ecModel.cid,
					variableId : variableModel.cid,
					siteId : ecModel.attributes.siteId,
					startDate : variableModel.attributes.startDate.format(Config.DATE_FORMAT),
					endDate : variableModel.attributes.endDate.format(Config.DATE_FORMAT),
					property : variableModel.attributes.description
				};
			};
			var datasetCollection = this.model.get('datasetCollections')[Config.EC_DATASET];
			this._updateSelectedVariableContext(datasetCollection, Config.EC_DATASET, getContextVariable);
		},

		/*
		 * Sets up the event listeners for changes in the selected property for each site's variable for the ACIS dataset
		 * @param {BaseDatasetCollection} collection
		 */
		setupECModelListeners : function(collection) {
			this._setupDatasetVariableListeners(collection, this.updateSelectedECVariables);
		},


		/*
		 * DOM Event handlers
		 */
		removeVariable : function(ev) {
			var $button = $(ev.currentTarget);
			var id = $button.data('id');
			var variableId = $button.data('variable-id');
			var datasetKind = $button.data('dataset-kind');
			var datasetCollection = this.model.get('datasetCollections')[datasetKind];
			var datasetModel = datasetCollection.get(id);

			datasetModel.get('variables').get(variableId).set('selected', false);
		}
	});

	return view;
});


