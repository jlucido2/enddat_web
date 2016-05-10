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
			'click button' : 'removeVariable'
		},

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.selectedDatasets = _.object([
				[Config.PRECIP_DATASET, []],
				[Config.NWIS_DATASET, []]
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
			this.hasBeenRendered = true;
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
			return this;
		},

		/*
		 *  Model event listeners and helper functions
		 */

		setupDatasetCollectionsListeners : function(model, datasetCollections) {
			var precipCollection = datasetCollections[Config.PRECIP_DATASET];
			var nwisCollection = datasetCollections[Config.NWIS_DATASET];
			this.listenTo(precipCollection, 'reset', this.setupPrecipModelListeners);
			this.listenTo(nwisCollection, 'reset', this.setupNWISModelListeners);

			this.setupPrecipModelListeners(precipCollection);
			this.setupNWISModelListeners(nwisCollection);
		},

		_setupDatasetVariableListeners : function(collection, changeSelectedHandlerFnc, updateSelectedSiteVariables) {
			var self = this;

			collection.each(function(siteModel) {
				var variableCollection = siteModel.get('variables');
				variableCollection.each(function(variableModel) {
					self.listenTo(variableModel, 'change:selected', changeSelectedHandlerFnc);
				});
			});
			updateSelectedSiteVariables(collection);

			if (this.hasBeenRendered) {
				this.render();
			}
		},

		setupPrecipModelListeners : function(collection) {
			this._setupDatasetVariableListeners(collection, this.updatePrecipContext, _.bind(this._updateSelectedPrecipPoints, this));
		},

		setupNWISModelListeners : function(collection) {
			this._setupDatasetVariableListeners(collection, this.updateNWISContext, _.bind(this._updateSelectedNWISVariables, this));
		},

		updatePrecipContext : function() {
			this._updateSelectedPrecipPoints(this.model.get('datasetCollections')[Config.PRECIP_DATASET]);
			if (this.hasBeenRendered) {
				this.render();
			}
		},

		_getSelectedContextVars: function(collection, getContextVariable) {
			var contextVars = [];
			collection.each(function(siteModel) {
				var selectedVariables = siteModel.get('variables').getSelectedVariables();
				_.each(selectedVariables, function(variableModel) {
					contextVars.push(getContextVariable(variableModel, siteModel));
				});
			});
			return contextVars;
		},

		_updateSelectedPrecipPoints : function(precipCollection) {
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

			this.selectedDatasets[Config.PRECIP_DATASET] = this._getSelectedContextVars(precipCollection, getContextVariable);
		},

		updateNWISContext : function() {
			this._updateSelectedNWISVariables(this.model.get('datasetCollections')[Config.NWIS_DATASET]);
			if (this.hasBeenRendered) {
				this.render();
			}
		},

		_updateSelectedNWISVariables : function(nwisCollection) {
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
			this.selectedDatasets[Config.NWIS_DATASET] = this._getSelectedContextVars(nwisCollection, getContextVariable);
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

			if (id === variableId) {
				datasetModel.set('selected', false);
			}
			else {
				datasetModel.get('variables').get(variableId).set('selected', false);
			}
		}
	});

	return view;
});


