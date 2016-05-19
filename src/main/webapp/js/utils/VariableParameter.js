/* jslint browser: true */

define([], function() {
	"use strict";

	/*
	* @constructs
	* @param {Object} attributes
	*		@prop {String} name - The name to be used for the url parameter
	*		@prop {String} value - Represents the variable
	*		@prop {String} colName - The column label which will be used in the resulting results file
	*/
	var VariableParameter = function(attributes) {
		this.name = attributes.name;
		this.value = attributes.value;
		this.colName = attributes.colName;
		this.timeSeriesOption = attributes.timeSeriesOption;

		/*
		 * @param {String} statParam - String describing the statistic to apply to the variable
		 * @param {String} statColName - String to be appended to the variable's column name, describing the statistic
		 * @returns {Object with name and value properties} representing the url parameter for the variable with the statistics applied to it.
		 */
		this.getUrlParameter = function() {
			var isRaw = (this.timeSeriesOption.statistic === 'raw');
			var statParam = (isRaw) ? '' : this.timeSeriesOption.statistic + ':' + this.timeSeriesOption.timeSpan;
			var statColName = (isRaw) ? '' : this.timeSeriesOption.colName + ' ' + this.timeSeriesOption.timeSpan + ' hr';
			var value = (statParam) ? this.value + ':' + statParam : this.value;
			var colName = (statColName) ? this.colName + ' ' + statColName : this.colName;

			return {
				name : this.name,
				value : value + '!' + colName
			};
		};
	};

	return VariableParameter;
});
