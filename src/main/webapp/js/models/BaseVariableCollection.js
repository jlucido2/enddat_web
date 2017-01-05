/* jslint browser: true */

define([
	'underscore',
	'backbone',
	'moment',
	'utils/dateUtils'
], function(_, Backbone, moment, dateUtils) {
	"use strict";
	/*
	 * Models are expected to have the following properties:
	 *		@prop {moment} startDate - The start date for the date range of this variable
	 *		@prop {moment} endDate - The end date for the date range of this variable
	 *		@prop {VariableParameter} variable
	 *	In addition the selected Boolean property will be used to identify variables that have been selected for
	 *	Additional properties may be added for additional variable data fields
	 *
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

		/*
		 * @param {Array of Objects} filters - where the objects property keys should match variable keys
		 * @param {Object with start and end keys representing moment objects} dateFilter
		 * @return true if any variables in the collection match any of the filters
		 */
		hasVariablesInFilters : function(filters, dateFilter) {
			var matchFilters = _.map(filters, function(filter) {
				return _.matcher(filter);
			});
			var validDateRange = (dateFilter) && (dateFilter.start) && (dateFilter.end);
			return this.some(function(variableModel) {
				var inFilter =_.some(matchFilters, function(matchFilter) {
					return matchFilter(variableModel.attributes);
				});
				var inDateFilter = validDateRange ? dateUtils.dateRangeOverlaps(dateFilter, {
					start : variableModel.get('startDate'),
					end : variableModel.get('endDate')
				}) : true;
				return inFilter && inDateFilter;
			});
		},

		/*
		 * Set the selected property to true for all variables in the collection that match
		 * at least one of the filters. If there is a date filter, set the selected property if the
		 * variable is in the date filter, otherwise set it to false.
		 * @param {Array of Objects} filters - where the objects property keys should match variable keys
		 * @param {Object with start and end keys representing moment objects} dateFilter
		 */
		selectVariablesInFilters : function(filters, dateFilter) {
			var matchFilters = _.map(filters, function(filter) {
				return _.matcher(filter);
			});
			var validDateRange = (dateFilter) && (dateFilter.start) && (dateFilter.end);
			this.each(function(variableModel) {
				var inFilter =_.some(matchFilters, function(matchFilter) {
					return matchFilter(variableModel.attributes);
				});
				var inDateFilter = validDateRange ? dateUtils.dateRangeOverlaps(dateFilter, {
					start : variableModel.get('startDate'),
					end : variableModel.get('endDate')
				}) : true;
				if (inFilter) {
					variableModel.set('selected', inDateFilter);
				}
			});
		},

		/*
		 * Unset the selected property for all variables in the collection that match
		 * at least one of the filters
		 * @param {Array of Objects} filters - where the objects property keys should match variable keys
		 */
		unselectVariablesInFilters : function(filters) {
			var matchFilters = _.map(filters, function(filter) {
				return _.matcher(filter);
			});
			this.each(function(variableModel) {
				var inFilter =_.some(matchFilters, function(matchFilter) {
					return matchFilter(variableModel.attributes);
				});

				if (inFilter) {
					variableModel.unset('selected');
				}
			});
		}
	});

	return collection;
});