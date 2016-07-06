/* jslint browser: true */

define([
	'underscore',
	'backbone',
	'moment'
], function(_, Backbone, moment) {
	"use strict";
	/*
	 * Models are expected to have startDate and endDate property and to use the selected property to indicate that
	 * this model has been chosen (for further processing)
	 */
	var collection = Backbone.Collection.extend({

		/*
		 * @returns {Boolean} - true if any model in the collection has the selected property set to true.
		 */
		hasSelectedVariables : function() {
			return this.some(function(model) {
				return model.has('selected') && model.get('selected');
			});
		},

		/*
		 * @returns {Array of models} where selected is set to true.
		 */
		getSelectedVariables : function() {
			return this.filter(function(model) {
				return model.has('selected') && model.get('selected');
			});
		},
		/*
		 * @returns {Object} - with start and end properties.
		 * returns the range of dates where at least one variable in the collection has data. If the
		 * collection contains no variables, return undefined.
		 */
		getDateRange : function() {
			var dateRange = undefined;
			if (this.length !== 0) {
				dateRange = {
					start : moment.min(this.pluck('startDate')),
					end : moment.max(this.pluck('endDate'))
				};
			}
			return dateRange;
		},

		/*
		 * Returns the union of the date ranges for the selected variables.
		 * @returns {Object} with start and end properties which are moments. Returns undefined if
		 * no variables are selected
		 */
		getSelectedDateRange : function() {
			var getStartDate = function(variableModel) {
				return variableModel.get('startDate');
			};
			var getEndDate = function(variableModel) {
				return variableModel.get('endDate');
			};
			var selectedVars = this.getSelectedVariables();
			var result = undefined;
			if (selectedVars.length > 0) {
				result = {
					start : moment.min(_.map(selectedVars, getStartDate)),
					end : moment.max(_.map(selectedVars, getEndDate))
				};
			}

			return result;
		},

		/*
		 * @returns {Object} - with start and end properties.
		 * returns the range of dates where each variable in the collection has data. If no such range
		 * return undefined.
		 */
		getOverlappingDateRange : function() {
			var dateRange = undefined;
			if (this.length !== 0) {
				dateRange = {
					start : moment.max(this.pluck('startDate')),
					end : moment.min(this.pluck('endDate'))
				};
				if (dateRange.start.isAfter(dateRange.end)) {
					dateRange = undefined;
				}
			}
			return dateRange;
		},

		/*
		 * @returns {Object} - with start and end properties.
		 * returns the range of dates where each variable in the collection has data. If no such range
		 * return undefined.
		 */
		getSelectedOverlappingDateRange : function() {
			var selectedVars = this.getSelectedVariables();
			var dateRange = undefined;
			if (selectedVars.length !== 0) {
				dateRange = {
					start : moment.max(_.map(selectedVars, function(model) { return model.get('startDate'); })),
					end : moment.min(_.map(selectedVars, function(model) { return model.get('endDate'); }))
				};
				if (dateRange.start.isAfter(dateRange.end)) {
					dateRange = undefined;
				}
			}
			return dateRange;
		},

		selectVariablesInFilter : function(filter) {
			var matchFilter = _.matcher(filter);
			var variableModelsInFilter = _.filter(this.models, function(variableModel) {
				return matchFilter(variableModel.attributes);
			});
			_.each(variableModelsInFilter, function(variableModel) {
				variableModel.set('selected', true);
			});
		},

		unselectVariablesInFilter : function(filter) {
			var matchFilter = _.matcher(filter);
			_.chain(this.models)
				.filter(function(variableModel) {
					return matchFilter(variableModel.attributes);
				})
				.each(function(variableModel) {
					variableModel.unset('selected');
				});
		}
	});

	return collection;
});