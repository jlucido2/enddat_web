/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'module'
], function($, _, module) {
	"use strict";

	var variableDatasetMapping = (function() {
		var self = {};
		var mapping = {};
		$.getJSON(module.config().variableDatasetMappingUrl, function(data) {
			mapping = data;
		});

		/*
		 * @returns {Object} - variable kind to dataset mapping object
		 */
		self.getMapping = function() {
			return mapping;
		};

		/*
		 * @param {Array of Strings} variables
		 * @returns {Array of Strings} - datasets that contain one or more of the variables
		 */
		self.getDatasets = function(variables) {
			var varMappings = _.pick(mapping, variables);
			return _.chain(varMappings)
				.map(function(vm) {
					return _.pluck(vm.datasets, 'name');
				})
				.flatten()
				.uniq()
				.value();
		};

		/*
		 * @param {String} dataset
		 * @param {Array of String} variables
		 * @returns {Array of Objects} - the filters for the dataset and set of variables. Can be used directly to filter
		 *		a datasets variables.
		 */
		self.getFilters = function(dataset, variables) {
			var getOneVarFilter = function(dataset, variable) {
				var findResult =  _.find(mapping[variable].datasets, function (d) {
					return d.name === dataset;
				});
				var result;
				if (findResult) {
					result = findResult.filter;
				}
				else {
					result = [];
				}
				return result;
			};

			return _.flatten(_.map(variables, function(variable) {
				return getOneVarFilter(dataset, variable);
			}));
		};

		return self;
	})();

	return variableDatasetMapping;
});
