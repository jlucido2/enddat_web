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

		setupPrecipModelListeners : function(collection) {
			collection.each(function(precipModel) {
				this.listenTo(precipModel, 'change:selected', this.updatePrecipContext);
			}, this);
			this._updateSelectedPrecipPoints(collection);

			if (this.hasBeenRendered) {
				this.render();
			}
		},

		setupNWISModelListeners : function(collection) {
			collection.each(function(nwisModel) {
				var variableModels = nwisModel.get('variables');
				variableModels.each(function(variableModel) {
					this.listenTo(variableModel, 'change:selected', this.updateNWISContext);
				}, this);
			}, this);
			this._updateSelectedNWISVariables(collection);

			if (this.hasBeenRendered) {
				this.render();
			}
		},

		updatePrecipContext : function() {
			this._updateSelectedPrecipPoints(this.model.get('datasetCollections')[Config.PRECIP_DATASET]);
			if (this.hasBeenRendered) {
				this.render();
			}
		},

		_updateSelectedPrecipPoints : function(precipCollection) {
			var isSelected = function(model) {
				return model.has('selected') && model.get('selected');
			};
			var getContextVariable = function(model) {
				return {
					modelId : model.cid,
					variableId : model.cid,
					siteId : (parseFloat(model.attributes.lat)).toFixed(3) + ', ' + (parseFloat(model.attributes.lon)).toFixed(3),
					startDate : model.attributes.startDate.format(Config.DATE_FORMAT),
					endDate : model.attributes.endDate.format(Config.DATE_FORMAT),
					property : model.attributes.y + ':' + model.attributes.x
				};
			};

			this.selectedDatasets[Config.PRECIP_DATASET] =  precipCollection.chain()
				.filter(isSelected)
				.map(getContextVariable)
				.value();
		},

		updateNWISContext : function() {
			this._updateSelectedNWISVariables(this.model.get('datasetCollections')[Config.NWIS_DATASET]);
			if (this.hasBeenRendered) {
				this.render();
			}
		},

		_updateSelectedNWISVariables : function(nwisCollection) {
			this.selectedDatasets[Config.NWIS_DATASET] = nwisCollection.reduce(function(memo, nwisModel) {
				var variableModels = nwisModel.get('variables');

				var isSelected = function(variableModel) {
					return variableModel.has('selected') && variableModel.get('selected');
				};
				var getContextVariable = function(variableModel) {
					return {
						modelId : nwisModel.cid,
						variableId : variableModel.cid,
						siteId : nwisModel.attributes.siteNo,
						startDate : variableModel.attributes.startDate.format(Config.DATE_FORMAT),
						endDate : variableModel.attributes.endDate.format(Config.DATE_FORMAT),
						property : variableModel.attributes.name
					};
				};

				var selectedVariables = variableModels.chain()
					.filter(isSelected)
				   .map(getContextVariable)
				   .value();

				return memo.concat(selectedVariables);
		   }, []);
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


