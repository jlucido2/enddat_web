/* jslint browser: true */
/* global parseFloat */

define([
	'underscore',
	'Config',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/variableSummary'
], function(_, Config, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Selected Variables',
		panelBodyId : 'variable-summary-panel-body',

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.selectedDatasets = _.object([
				[Config.PRECIP_DATASET, []],
				[Config.NWIS_DATASET, []]
			]);
			this.hasBeenRendered = false;

			//Set up model event listeners
			if (this.model.has('datasetCollections')) {
					this.initializeDatasetCollections(this.model, this.model.get('datasetCollections'));
				}
				else {
					this.listenTo(this.model, 'change:datasetCollections', this.initializeDatasetCollections);
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
			this.context.hasSelectedVariables = _.reduce(this.context.selectedDatasets, function(foundVariables, dataset) {
				return foundVariables || !_.isEmpty(dataset.variables);
			}, false);

			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			return this;
		},

		initializeDatasetCollections : function(model, datasetCollections) {
			var precipCollection = datasetCollections[Config.PRECIP_DATASET];
			var nwisCollection = datasetCollections[Config.NWIS_DATASET];
			this.listenTo(precipCollection, 'reset', this.initializePrecipCollection);
			this.listenTo(nwisCollection, 'reset', this.initializeNWISCollection);

			this.initializePrecipCollection(precipCollection);
			this.initializeNWISCollection(nwisCollection);
		},

		initializePrecipCollection : function(collection) {
			collection.each(function(precipModel) {
				this.listenTo(precipModel, 'change:selected', this.updatePrecipContext);
			}, this);
			this._updateSelectedPrecipPoints(collection);

			if (this.hasBeenRendered) {
				this.render();
			}
		},

		initializeNWISCollection : function(collection) {
			collection.each(function(nwisModel) {
				this.listenTo(nwisModel, 'change:parameters', this.updateNWISContext);
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
				var parameters = nwisModel.get('parameters');

				var isSelected = function(param) {
					return _.has(param, 'selected') && param.selected;
				};
				var getContextVariable = function(param) {
					return {
						siteId : nwisModel.get('siteNo'),
						startDate : param.startDate.format(Config.DATE_FORMAT),
						endDate : param.endDate.format(Config.DATE_FORMAT),
						property : param.name
					};
				};

				var selectedParams = _.chain(parameters)
					.filter(isSelected)
				   .map(getContextVariable)
				   .value();

				return memo.concat(selectedParams);
		   }, []);
		}
	});

	return view;
});


