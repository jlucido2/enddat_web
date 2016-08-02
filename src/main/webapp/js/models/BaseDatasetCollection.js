/* jslint browser: true */

define([
	'underscore',
	'moment',
	'backbone',
	'utils/dateUtils'
], function(_, moment, Backbone, dateUtils) {
	"use strict";
	/*
	 * @constructs - the collection contains models with startDate and endDate properties, both moment objects and a
	 * variables property which is BaseVariableCollection.
	 */
	var collection = Backbone.Collection.extend({

		reset : function() {
			this.each(function(siteModel) {
				// Cleans up the variable collections so that the variable models can be garbage collected.
				if (siteModel.has('variables')) {
					siteModel.get('variables').reset();
				}
			});

			Backbone.Collection.prototype.reset.apply(this, arguments);
		},

		/*
		 * @returns {Boolean} - true if any of the models contain a variable that has been selected
		 */
		hasSelectedVariables : function() {
			return this.some(function(model) {
				return model.get('variables').hasSelectedVariables();
			});
		},

		/*
		 * @returns {Array of Backbone.Model representing variables
		 */
		getSelectedVariables : function() {
			return this.chain()
				.map(function(datasetModel) {
					return datasetModel.get('variables').getSelectedVariables();
				})
				.flatten()
				.value();
		},
		/*
		 * @ returns {Array of Backbone.Models} - each model represents a site with one or more selected variables
		 */
		
		getSitesWithSelectedVariables: function() {
			var selectedSites = this.filter(function(datasetModel) {
				return datasetModel.get('variables').hasSelectedVariables();
			});
			return selectedSites;
		},

		/*
		 * The startDate and endDate values in each model are assumed to be moment objects
		 * @param {Object} dateFilter - has start and end properties that are moment objects.
		 * @returns {Array of Backbone.Model} whose startDate and endDate range overlaps the function parameters.
		 *		If startDate or endDate are falsy, all of the models in the collection are returned.
		 */
		getSiteModelsWithinDateFilter : function(dateFilter) {
			var result;

			if (_.has(dateFilter, 'start') && (dateFilter.start) && _.has(dateFilter, 'end') && (dateFilter.end)) {
				result = this.filter(function(model) {
					return dateUtils.dateRangeOverlaps(model.attributes.variables.getDateRange(), dateFilter);
				});
			}
			else {
				result = this.toArray();
			}

			return result;
		},

		/*
		 * @returns {Array of Objects with name and value properties} -
		 *		 representing the URL parameters for the selected variables
		 */
		getSelectedVariablesUrlParams : function() {
			var params = [];
			params = this.map(function(siteModel)  {
				return siteModel.get('variables').getSelectedUrlParams(siteModel.attributes);
			});
			return _.flatten(params);
		},

		/*
		 * Return the date range over which data is available for the selected variables
		 * @returns {Object with start and end properties which are moments}. If no selected
		 * variables return undefined.
		 */
		getSelectedDateRange : function() {
			var result = undefined;
			var siteSelectedVarsDateRange = this.chain()
				.filter(function(siteModel) {
					return siteModel.get('variables').hasSelectedVariables();
				})
				.map(function(siteModel) {
					return siteModel.get('variables').getSelectedDateRange();
				})
				.value();

			if ((siteSelectedVarsDateRange.length > 0) && !_.contains(siteSelectedVarsDateRange, undefined)) {
				result = {
					start : moment.min(_.pluck(siteSelectedVarsDateRange, 'start')),
					end : moment.max(_.pluck(siteSelectedVarsDateRange, 'end'))
				};
			}
			return result;
		},

		/*
		 * @param {Array of Objects} filters - which can be used to filter a dataset variables
		 * @param {Object with start and end keys representing moment objects} dateFilter
		 * @returns {Array of models} - Returns the site models that contain variables within one or more of the filters
		 */
		getSitesWithVariableInFilters : function(filters, dateFilter) {
			return this.filter(function(siteModel) {
				return siteModel.attributes.variables.hasVariablesInFilters(filters, dateFilter);
			});
		},

		/*
		 * For each siteModel in the collection, update the variables which match any filter
		 * in filters to have the selected property set to true. Trigger the event 'dataset:updateVariablesInFilter'
		 * when the process is complete
		 *
		 * @param {Array of Objects} filters - Should match variable properties
		 * @param {Object with start and end keys representing moment objects} dateFilter
		 */
		selectAllVariablesInFilters : function(filters, dateFilter) {
			this.each(function(siteModel) {
				var variables = siteModel.get('variables');
				variables.selectVariablesInFilters(filters, dateFilter);
			});
			this.trigger('dataset:updateVariablesInFilter');
		},

		/*
		 * For each siteModel in the collection, update the variables which match any filter
		 * in filters to unset the selected property. Trigger the event 'dataset:updateVariablesInFilter'
		 * when the process is complete
		 *
		 * @param {Array of Objects} filters - Should match variable properties
		 */
		unselectAllVariablesInFilters : function(filters) {
			this.each(function(siteModel) {
				var variables = siteModel.get('variables');
				variables.unselectVariablesInFilters(filters);
			});
			this.trigger('dataset:updateVariablesInFilter');
		}
	});

	return collection;
});


