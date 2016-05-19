/* jslint browser: true */

define([
	'underscore',
	'utils/VariableParameter',
	'models/BaseVariableCollection'
], function(_, VariableParameter, BaseVariableCollection) {
	"use strict";

	var variableId = 'precip3';
	var variableName = 'Total precip - 1 hr';

	/*
	 * @constructs
	 * models contain properties for x, y, startDate, endDate, and optional selected
	 */
	var collection = BaseVariableCollection.extend({
		/*
		 * @param {String} timeBounds - Represents the number time steps in the dataset.
		 * @returns {Array of VariableParameter}
		 */
		getSelectedUrlParams : function(timeBounds) {
			var selectedVars = this.getSelectedVariables();
			return _.chain(selectedVars)
				.map(function(model) {
					var attrs = model.attributes;
					var varUrlParams =  _.map(attrs.timeSeriesOptions, function(tsOption) {
						return new VariableParameter({
							name : 'Precip',
							value : attrs.y + ':' + attrs.x + ':' + timeBounds + ':' + variableId,
							colName : variableName + ' [' + attrs.y + ',' + attrs.x + ']',
							timeSeriesOption : tsOption
						});
					});
					return varUrlParams;
				})
				.flatten()
				.value();
		}
	});

	return collection;
});

